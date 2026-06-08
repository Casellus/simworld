# Ranking & Gamification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistema XP mensile con classifica top 50, badge rank in navbar, reset automatico il 1° del mese, anti-farming via ledger.

**Architecture:** XP assegnati da una funzione Postgres `award_xp` (atomica, idempotente via ledger `xp_events`) chiamata da un helper TS `awardXp` via RPC. Le server action esistenti chiamano l'helper dopo le mutazioni riuscite. Rank calcolato dalle soglie. Frontend Server Component su `/ranking` + badge nel `UserMenu`.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase (Postgres + pg_cron), Tailwind v4.

---

## Note di contesto (leggi prima)

- Questo progetto **non ha test runner configurato**. La verifica di ogni task è: `npx tsc --noEmit` (typecheck) + verifica manuale descritta. Niente TDD con framework di test — la "prova" è il typecheck verde e l'ispezione del comportamento.
- SQL va eseguito **manualmente** dall'utente nel SQL Editor di Supabase. I task SQL producono lo script; l'utente lo incolla ed esegue. Non possiamo eseguirlo da qui (nessun accesso al DB).
- Admin client: `createAdminClient()` da `@/lib/supabase/server` (service role, bypassa RLS). Necessario per scrivere XP sul profilo di un **altro** utente (caso like → autore).
- `revalidatePath` importato da `next/cache`.

## File Structure

- **Create** `src/lib/xp.ts` — costanti rank, `calcRank()`, `rankEmoji()`, helper `awardXp()`
- **Create** `src/app/ranking/page.tsx` — Server Component classifica top 50
- **Create** `src/components/rank-badge.tsx` — badge emoji rank cliccabile (per navbar)
- **Modify** `src/lib/constants.ts` — aggiunge `XP_VALUES`
- **Modify** `src/app/assetti/actions.ts` — XP su createSetupRecord, uploadSetupFull, voteSetup
- **Modify** `src/app/eventi/actions.ts` — XP su createEvent, joinEvent
- **Modify** `src/app/team/actions.ts` — XP su createTeam, updateApplication(accepted)
- **Modify** `src/app/cerca/actions.ts` — XP su createRecruitmentPost
- **Modify** `src/components/header.tsx` — renderizza RankBadge accanto a UserMenu
- **SQL script** `docs/superpowers/sql/ranking-setup.sql` — schema + funzione + cron (eseguito a mano su Supabase)

---

## Task 1: Schema DB + funzione award_xp + cron (SQL)

**Files:**
- Create: `docs/superpowers/sql/ranking-setup.sql`

- [ ] **Step 1: Scrivi lo script SQL completo**

Crea `docs/superpowers/sql/ranking-setup.sql` con questo contenuto:

```sql
-- ════════════════════════════════════════════════
-- RANKING & GAMIFICATION — setup completo
-- Eseguire nel SQL Editor di Supabase (una volta).
-- ════════════════════════════════════════════════

-- 1. Campi su profiles
alter table public.profiles
  add column if not exists monthly_xp integer not null default 0,
  add column if not exists current_rank text not null default 'Bronzo';

-- 2. Tabella storico mensile
create table if not exists public.ranking_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month_year text not null,
  xp_earned integer not null,
  final_rank text not null,
  created_at timestamptz not null default now(),
  unique (user_id, month_year)
);

-- 3. Ledger anti-farming
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  ref_id text not null,
  amount integer not null,
  month_year text not null,
  created_at timestamptz not null default now(),
  unique (user_id, action_type, ref_id)
);

-- RLS: lettura pubblica della classifica via profiles (già gestita altrove).
-- xp_events e ranking_history scritti solo dal service role / funzione SECURITY DEFINER.
alter table public.xp_events enable row level security;
alter table public.ranking_history enable row level security;
-- nessuna policy = nessun accesso client diretto; la funzione award_xp è SECURITY DEFINER.

-- 4. Soglie rank → funzione pura
create or replace function public.calc_rank(xp integer)
returns text
language sql
immutable
as $$
  select case
    when xp >= 2500 then 'Leggenda'
    when xp >= 1200 then 'Oro'
    when xp >= 500  then 'Argento'
    else 'Bronzo'
  end;
$$;

-- 5. Funzione atomica award_xp (idempotente via ledger)
create or replace function public.award_xp(
  p_user_id uuid,
  p_action_type text,
  p_ref_id text,
  p_amount integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month text := to_char(now(), 'YYYY-MM');
  v_new_xp integer;
begin
  -- insert nel ledger; se già esiste (stessa azione+oggetto) non fa nulla
  insert into public.xp_events (user_id, action_type, ref_id, amount, month_year)
  values (p_user_id, p_action_type, p_ref_id, p_amount, v_month)
  on conflict (user_id, action_type, ref_id) do nothing;

  -- se non ha inserito nulla → già premiato → esci senza toccare l'XP
  if not found then
    return;
  end if;

  -- incrementa XP e ricalcola rank
  update public.profiles
  set monthly_xp = monthly_xp + p_amount,
      current_rank = public.calc_rank(monthly_xp + p_amount)
  where id = p_user_id
  returning monthly_xp into v_new_xp;
end;
$$;

-- 6. Reset mensile: archivia + azzera
create or replace function public.monthly_ranking_reset()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev_month text := to_char(now() - interval '1 day', 'YYYY-MM');
begin
  -- snapshot di chi ha guadagnato XP
  insert into public.ranking_history (user_id, month_year, xp_earned, final_rank)
  select id, v_prev_month, monthly_xp, current_rank
  from public.profiles
  where monthly_xp > 0
  on conflict (user_id, month_year) do nothing;

  -- reset
  update public.profiles
  set monthly_xp = 0, current_rank = 'Bronzo'
  where monthly_xp <> 0 or current_rank <> 'Bronzo';
end;
$$;

-- 7. pg_cron: 1° del mese alle 00:00
create extension if not exists pg_cron;
select cron.schedule(
  'monthly-ranking-reset',
  '0 0 1 * *',
  $$ select public.monthly_ranking_reset(); $$
);
```

- [ ] **Step 2: L'utente esegue lo script su Supabase**

Istruzione all'utente: aprire Supabase → SQL Editor → incollare il contenuto di `docs/superpowers/sql/ranking-setup.sql` → Run. Verificare che non ci siano errori. Se `pg_cron` non è disponibile, abilitarlo da Database → Extensions.

Verifica: query `select monthly_xp, current_rank from profiles limit 1;` deve restituire `0` / `Bronzo`.

- [ ] **Step 3: Commit dello script**

```bash
git add docs/superpowers/sql/ranking-setup.sql
git commit -m "feat(sql): ranking schema, award_xp function, monthly reset cron"
```

---

## Task 2: Costanti XP

**Files:**
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Aggiungi XP_VALUES in fondo a constants.ts**

In `src/lib/constants.ts`, aggiungi alla fine del file:

```ts
export const XP_VALUES = {
  setup_create: 50,
  like_given: 5,
  like_received: 5,
  event_create: 40,
  event_join: 15,
  team_create: 30,
  team_join: 20,
  post_create: 20,
} as const;

export type XpAction = keyof typeof XP_VALUES;
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat: add XP_VALUES constants for gamification actions"
```

---

## Task 3: Helper XP (calcRank, rankEmoji, awardXp)

**Files:**
- Create: `src/lib/xp.ts`

- [ ] **Step 1: Crea src/lib/xp.ts**

```ts
import "server-only";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { XP_VALUES, type XpAction } from "@/lib/constants";

export const RANKS = [
  { rank: "Bronzo", minXp: 0, emoji: "🥉" },
  { rank: "Argento", minXp: 500, emoji: "🥈" },
  { rank: "Oro", minXp: 1200, emoji: "🥇" },
  { rank: "Leggenda", minXp: 2500, emoji: "👑" },
] as const;

export function calcRank(xp: number): string {
  let result = RANKS[0].rank;
  for (const r of RANKS) {
    if (xp >= r.minXp) result = r.rank;
  }
  return result;
}

export function rankEmoji(rank: string | null | undefined): string {
  return RANKS.find((r) => r.rank === rank)?.emoji ?? "🥉";
}

/**
 * Assegna XP a un utente in modo idempotente.
 * L'anti-farming è garantito dalla funzione Postgres award_xp (UNIQUE su ledger).
 * Non lancia: gli errori XP non devono far fallire l'azione utente principale.
 */
export async function awardXp(
  userId: string,
  action: XpAction,
  refId: string,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("award_xp", {
      p_user_id: userId,
      p_action_type: action,
      p_ref_id: refId,
      p_amount: XP_VALUES[action],
    });
    if (error) {
      console.error("awardXp failed:", action, refId, error.message);
      return;
    }
    revalidatePath("/ranking");
  } catch (e) {
    console.error("awardXp threw:", e);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore. (Se segnala `server-only` mancante: è già in Next.js, nessun install.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/xp.ts
git commit -m "feat: add xp helper — calcRank, rankEmoji, awardXp via RPC"
```

---

## Task 4: Aggancio XP su assetti (create + like)

**Files:**
- Modify: `src/app/assetti/actions.ts`

- [ ] **Step 1: Importa awardXp in cima al file**

In `src/app/assetti/actions.ts`, dopo gli import esistenti aggiungi:

```ts
import { awardXp } from "@/lib/xp";
```

- [ ] **Step 2: XP su createSetupRecord**

In `createSetupRecord`, subito prima di `revalidatePath("/assetti");` (alla fine, dopo `if (!created?.id) ...`), aggiungi:

```ts
    await awardXp(user.id, "setup_create", created.id);
```

- [ ] **Step 3: XP su uploadSetupFull**

In `uploadSetupFull`, trova l'insert che crea il setup e ne ricava l'id (`created.id` o equivalente). Subito prima del `revalidatePath("/assetti")` finale di quella funzione, aggiungi la stessa riga usando l'id del setup creato:

```ts
    await awardXp(user.id, "setup_create", created.id);
```

(Se la variabile non si chiama `created`, usa il nome reale della riga inserita con `.select("id").single()`. Se l'insert non seleziona l'id, aggiungi `.select("id").single()` all'insert e leggi `created.id`.)

- [ ] **Step 4: XP su voteSetup (like dato + ricevuto)**

In `voteSetup`, il blocco `else` gestisce `value === 1 | -1`. Serve premiare solo `value === 1` (like). Modifica così: dopo l'upsert del voto e PRIMA del ricalcolo `rating_sum`, recupera l'autore del setup e assegna XP a entrambi solo se `value === 1`:

```ts
  if (value === 1) {
    // XP a chi vota
    await awardXp(user.id, "like_given", `${setupId}:${user.id}`);
    // XP all'autore del setup
    const { data: setupRow } = await supabase
      .from("setups")
      .select("user_id")
      .eq("id", setupId)
      .single();
    if (setupRow?.user_id && setupRow.user_id !== user.id) {
      await awardXp(setupRow.user_id, "like_received", `${setupId}:${user.id}`);
    }
  }
```

Posiziona questo blocco subito dopo il blocco `if (value === 0) {...} else {...}` esistente, prima del `const { data: votes } = ...`.

Nota: `ref_id` = `${setupId}:${user.id}` → toggle del like non ridà XP. L'autore non guadagna XP da auto-like (guard `!== user.id`).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore.

- [ ] **Step 6: Commit**

```bash
git add src/app/assetti/actions.ts
git commit -m "feat: award XP on setup create and like (voter + author)"
```

---

## Task 5: Aggancio XP su eventi (create + join)

**Files:**
- Modify: `src/app/eventi/actions.ts`

- [ ] **Step 1: Importa awardXp**

```ts
import { awardXp } from "@/lib/xp";
```

- [ ] **Step 2: XP su createEvent**

`createEvent` fa `redirect()` dopo l'insert, quindi l'XP va assegnato PRIMA del redirect. L'insert seleziona `.select("slug")` — serve anche l'id. Modifica il `.select("slug")` dell'insert in `.select("id, slug")`. Poi, subito dopo `if (error) throw new Error(error.message);` e prima di `revalidatePath("/eventi");`, aggiungi:

```ts
  await awardXp(user.id, "event_create", created.id);
```

- [ ] **Step 3: XP su joinEvent**

In `joinEvent`, dopo `if (error) return { error: error.message };` e prima di `revalidatePath("/eventi");`, aggiungi:

```ts
  await awardXp(user.id, "event_join", eventId);
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore.

- [ ] **Step 5: Commit**

```bash
git add src/app/eventi/actions.ts
git commit -m "feat: award XP on event create and join"
```

---

## Task 6: Aggancio XP su team (create + join via accept)

**Files:**
- Modify: `src/app/team/actions.ts`

- [ ] **Step 1: Importa awardXp**

```ts
import { awardXp } from "@/lib/xp";
```

- [ ] **Step 2: XP su createTeam**

`createTeam` fa l'insert con `.select("id, slug")` → la riga è in `team` (variabile `data` destrutturata). Dopo che il team è creato con successo (dopo il blocco che inserisce `team_games`), e prima del `redirect`/`revalidatePath` finale, aggiungi:

```ts
    await awardXp(user.id, "team_create", team.id);
```

(Usa il nome reale della variabile che contiene la riga team inserita. Cerca `.from("teams").insert(...).select("id, slug")` e usa quel risultato.)

- [ ] **Step 3: XP su updateApplication (candidatura accettata)**

In `updateApplication`, quando `status === "accepted"` e l'utente viene aggiunto a `team_members` (cerca il blocco `// add to team_members`), subito dopo l'upsert in `team_members` aggiungi XP all'utente che entra. La riga application selezionata contiene `user_id` e `team_id` (vedi `.select("id, team_id, user_id")`):

```ts
      await awardXp(app.user_id, "team_join", app.team_id);
```

(Usa il nome reale della variabile dell'application — cerca `.select("id, team_id, user_id")` e usa quella destrutturazione. Posiziona DENTRO il ramo `if (status === "accepted")`, dopo l'upsert in team_members.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore.

- [ ] **Step 5: Commit**

```bash
git add src/app/team/actions.ts
git commit -m "feat: award XP on team create and accepted join"
```

---

## Task 7: Aggancio XP su annunci bacheca

**Files:**
- Modify: `src/app/cerca/actions.ts`

- [ ] **Step 1: Importa awardXp**

```ts
import { awardXp } from "@/lib/xp";
```

- [ ] **Step 2: XP su createRecruitmentPost**

`createRecruitmentPost` fa `.from("recruitment_posts").insert({...})` senza selezionare l'id. Modifica l'insert aggiungendo `.select("id").single()` e cattura il risultato:

```ts
  const { data: createdPost, error } = await supabase.from("recruitment_posts").insert({
    // ...campi esistenti invariati...
  }).select("id").single();
```

Poi, dopo il controllo errore esistente (`if (error) ...`) e prima del `revalidatePath`/`redirect` finale, aggiungi:

```ts
  if (createdPost?.id) {
    await awardXp(user.id, "post_create", createdPost.id);
  }
```

(Assicurati che la variabile utente sia in scope — cerca `getUser()` all'inizio della funzione; se l'id utente è in `user.id`, usalo.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore.

- [ ] **Step 4: Commit**

```bash
git add src/app/cerca/actions.ts
git commit -m "feat: award XP on recruitment post create"
```

---

## Task 8: Componente RankBadge

**Files:**
- Create: `src/components/rank-badge.tsx`

- [ ] **Step 1: Crea il componente**

```tsx
import Link from "next/link";
import { rankEmoji } from "@/lib/xp";

export function RankBadge({ rank }: { rank: string | null | undefined }) {
  return (
    <Link
      href="/ranking"
      title={`Rank: ${rank ?? "Bronzo"} — vedi classifica`}
      className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/[0.08] transition-colors text-lg leading-none"
      aria-label={`Rank ${rank ?? "Bronzo"}, vai alla classifica`}
    >
      <span role="img" aria-hidden="true">{rankEmoji(rank)}</span>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add src/components/rank-badge.tsx
git commit -m "feat: add RankBadge component linking to ranking"
```

---

## Task 9: RankBadge nella navbar

**Files:**
- Modify: `src/components/header.tsx`

- [ ] **Step 1: Importa RankBadge**

In `src/components/header.tsx`, aggiungi tra gli import:

```ts
import { RankBadge } from "@/components/rank-badge";
```

- [ ] **Step 2: Render badge accanto a UserMenu (desktop)**

Nel blocco RIGHT ACTIONS desktop, modifica:

```tsx
          {profile && <NotificationBell />}
          {profile ? (
            <UserMenu profile={profile} />
          ) : (
            <NavAuthButtons />
          )}
```

in:

```tsx
          {profile && <NotificationBell />}
          {profile && <RankBadge rank={profile.current_rank} />}
          {profile ? (
            <UserMenu profile={profile} />
          ) : (
            <NavAuthButtons />
          )}
```

- [ ] **Step 3: Render badge nella barra MOBILE**

Nel blocco MOBILE, modifica:

```tsx
            {profile ? (
              <>
                <NotificationBell />
                <UserMenu profile={profile} />
              </>
            ) : (
              <MobileNavAuthButton />
            )}
```

in:

```tsx
            {profile ? (
              <>
                <NotificationBell />
                <RankBadge rank={profile.current_rank} />
                <UserMenu profile={profile} />
              </>
            ) : (
              <MobileNavAuthButton />
            )}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore. `profile.current_rank` esiste perché `getProfile()` fa `select("*")`. Se TS si lamenta del tipo di `profile`, è perché il tipo è inferito da Supabase — `current_rank` sarà presente dopo che il DB ha la colonna (Task 1). Se necessario, accedi con `(profile as { current_rank?: string }).current_rank`.

- [ ] **Step 5: Commit**

```bash
git add src/components/header.tsx
git commit -m "feat: show rank badge next to user menu in navbar"
```

---

## Task 10: Pagina /ranking (classifica top 50)

**Files:**
- Create: `src/app/ranking/page.tsx`

- [ ] **Step 1: Crea la pagina Server Component**

```tsx
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { rankEmoji } from "@/lib/xp";

export const metadata = { title: "Classifica — SimUniverse" };

type RankRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  monthly_xp: number;
  current_rank: string;
};

const RANK_STYLES: Record<string, string> = {
  Bronzo: "bg-amber-900/30 text-amber-300 border-amber-700/40",
  Argento: "bg-slate-400/15 text-slate-200 border-slate-400/40",
  Oro: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
  Leggenda: "bg-purple-500/15 text-purple-300 border-purple-500/40",
};

function positionEmoji(i: number): string | null {
  return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
}

export default async function RankingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, monthly_xp, current_rank")
    .order("monthly_xp", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as RankRow[];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-3">
          Classifica mensile
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Top piloti del mese
        </h1>
        <p className="mt-4 text-sm text-[var(--color-fg-muted)]">
          Guadagna XP caricando assetti, mettendo like, creando eventi e team. Reset il 1° di ogni mese.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] py-16 text-center text-sm text-[var(--color-fg-muted)]">
          Nessun pilota in classifica questo mese. Sii il primo a guadagnare XP!
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] overflow-hidden divide-y divide-[var(--color-border)]">
          {rows.map((r, i) => {
            const pos = positionEmoji(i);
            const name = r.display_name || r.username;
            return (
              <Link
                key={r.id}
                href={`/profilo/${r.username}`}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-8 shrink-0 text-center font-bold text-sm">
                  {pos ? <span className="text-xl">{pos}</span> : <span className="text-[var(--color-fg-muted)]">{i + 1}</span>}
                </div>
                <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 overflow-hidden flex items-center justify-center">
                  {r.avatar_url ? (
                    <Image src={r.avatar_url} alt="" width={36} height={36} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[var(--color-primary)]">{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{name}</p>
                  <p className="text-xs text-[var(--color-fg-muted)] truncate">@{r.username}</p>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${RANK_STYLES[r.current_rank] ?? RANK_STYLES.Bronzo}`}>
                  {rankEmoji(r.current_rank)} {r.current_rank}
                </span>
                <div className="shrink-0 text-right">
                  <span className="font-extrabold text-sm" style={{ fontFamily: "var(--font-heading)" }}>{r.monthly_xp}</span>
                  <span className="text-xs text-[var(--color-fg-muted)] ml-1">XP</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore.

- [ ] **Step 3: Verifica avatar remoti**

`Image` con `avatar_url` può venire da Supabase storage — già whitelisted in `next.config.ts` (`**.supabase.co`). Se gli avatar vengono da Google (OAuth), potrebbero non caricare: in tal caso il fallback è l'iniziale del nome (già gestito con `r.avatar_url ?`). Nessuna azione richiesta a meno che la verifica manuale mostri immagini rotte — in quel caso sostituire `Image` con `<img>` come fa `user-menu.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/ranking/page.tsx
git commit -m "feat: add /ranking page with top 50 monthly leaderboard"
```

---

## Task 11: Verifica end-to-end manuale

**Files:** nessuno (solo verifica)

- [ ] **Step 1: Avvia dev server**

Run: `npm run dev`
Apri `http://localhost:3000/ranking` → la pagina carica (vuota o con dati). Nessun errore in console.

- [ ] **Step 2: Verifica badge navbar**

Loggati. In alto a destra appare emoji 🥉 accanto al menu utente. Click → porta a `/ranking`.

- [ ] **Step 3: Verifica assegnazione XP**

Carica un assetto. Su Supabase: `select monthly_xp, current_rank from profiles where id = '<tuo-id>';` → `monthly_xp` = 50, rank `Bronzo`. Ricarica `/ranking` → compari con 50 XP.

- [ ] **Step 4: Verifica anti-farming (like)**

Metti like a un assetto, poi togli e rimetti il like più volte. Su Supabase: `select count(*) from xp_events where action_type = 'like_given' and ref_id = '<setupId>:<tuoId>';` → deve essere **1**. `monthly_xp` non cresce ad ogni toggle.

- [ ] **Step 5: Push finale**

```bash
git push SimWorld main
```

---

## Self-Review (completato in fase di scrittura)

- **Spec coverage:** schema (T1), award_xp+rank+anti-farm (T1, T3), XP_VALUES (T2), tutte le azioni della tabella spec (T4-T7), badge navbar (T8-T9), pagina /ranking top 50 con badge colorati + emoji posizione (T10), reset cron mensile (T1). Guide escluse (non esistono nel sito). ✓
- **Placeholder scan:** nessun TBD/TODO; ogni step ha codice o comando concreto. I punti "usa il nome reale della variabile" sono istruzioni precise di adattamento a codice esistente non un placeholder di logica. ✓
- **Type consistency:** `XpAction`, `awardXp(userId, action, refId)`, `calcRank`, `rankEmoji`, `current_rank`, `monthly_xp` coerenti tra task. La funzione SQL `award_xp` prende `(p_user_id, p_action_type, p_ref_id, p_amount)` e il TS la chiama con quei nomi esatti. ✓
