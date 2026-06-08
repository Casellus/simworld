# Sistema Ranking & Gamification Mensile — Design

**Data:** 2026-06-08
**Stato:** Approvato

## Obiettivo

Sistema di ranking mensile che assegna XP agli utenti in base ad azioni sul sito.
Reset automatico il 1° di ogni mese. Classifica top 50 visibile su `/ranking`.
Badge rank cliccabile accanto al menu utente in navbar.

## 1. Schema DB (Supabase)

### Modifiche a `profiles`
- `monthly_xp` — integer, default 0
- `current_rank` — text, default 'Bronzo'

### Nuova tabella `ranking_history`
Storico mensile, una riga per utente per mese.
- `id` — uuid PK
- `user_id` — uuid, FK → profiles(id)
- `month_year` — text, formato "YYYY-MM" (es. "2026-05")
- `xp_earned` — integer
- `final_rank` — text
- `created_at` — timestamptz default now()
- UNIQUE (user_id, month_year) — evita duplicati su retry del job

### Nuova tabella `xp_events` (ledger anti-farming)
Vedi sezione 3.1. Registra ogni assegnazione XP unica.
- `id` uuid PK
- `user_id` uuid → profiles
- `action_type` text
- `ref_id` text
- `amount` integer
- `month_year` text
- `created_at` timestamptz default now()
- UNIQUE (user_id, action_type, ref_id)

### Reset mensile — pg_cron
Job schedulato il 1° del mese alle 00:00:
1. Inserisce snapshot di ogni profilo in `ranking_history` (month_year = mese appena concluso, xp_earned = monthly_xp, final_rank = current_rank)
2. Azzera `monthly_xp = 0` e `current_rank = 'Bronzo'` per tutti i profili

Solo profili con `monthly_xp > 0` vengono archiviati (no righe vuote).

Il ledger `xp_events` NON viene azzerato col reset mensile — usa `ref_id` come id permanente
dell'oggetto, quindi resta valido tra i mesi (es. un assetto creato a maggio non ridà XP a
giugno, ed è corretto: l'azione è già stata premiata). Pulizia opzionale del ledger vecchio
fuori scope.

## 2. Soglie Rank

| Rank | XP minimo | Emoji |
|------|-----------|-------|
| Bronzo | 0 | 🥉 |
| Argento | 500 | 🥈 |
| Oro | 1200 | 🥇 |
| Leggenda | 2500 | 👑 |

Emoji medaglie/corona standard — visibili su tutti i dispositivi (incluso Windows).

## 3. Azioni che assegnano XP

| Azione | XP | File aggancio |
|--------|-----|---------------|
| Carica assetto | +50 | `assetti/actions.ts` (createSetup) |
| Metti like (voto +1) su assetto | +5 a chi vota | `assetti/actions.ts` (voteSetup, value=1) |
| Ricevi like sul tuo assetto | +5 all'autore | `assetti/actions.ts` (voteSetup, value=1) |
| Crea evento | +40 | `eventi/actions.ts` |
| Iscriviti a evento | +15 | `eventi/actions.ts` |
| Crea / entra in team | +30 | `team/actions.ts` |
| Pubblica annuncio bacheca | +20 | `cerca/actions.ts` |
| Scrivi guida | +60 | guide actions |

Nota: un like (voto +1) assegna +5 XP **sia a chi vota sia all'autore** dell'assetto.

## 3.1 Anti-farming (vale per TUTTE le azioni)

Ogni assegnazione XP è idempotente tramite un **ledger** `xp_events`.
Una riga = un'assegnazione unica. UNIQUE (user_id, action_type, ref_id) impedisce
il doppio conteggio sulla stessa azione + stesso oggetto.

Tabella `xp_events`:
- `id` uuid PK
- `user_id` uuid → profiles (chi riceve l'XP)
- `action_type` text (es. "setup_create", "like_given", "like_received", "event_join", "team_join", "post_create", "guide_create", "event_create")
- `ref_id` text (id dell'oggetto: setup_id, event_id, team_id, ecc. — per like_given/received è `setup_id:voter_id`)
- `amount` integer
- `month_year` text ("YYYY-MM")
- `created_at` timestamptz default now()
- UNIQUE (user_id, action_type, ref_id)

Effetto per ogni azione:
- **Carica assetto** — ref_id = setup_id. Cancella e ricrea = nuovo setup_id = legittimo nuovo XP. Stesso assetto non paga due volte.
- **Like dato/ricevuto** — ref_id = `setup_id:voter_id`. Togli/rimetti like = stesso ref_id = niente XP doppio.
- **Iscriviti evento** — ref_id = event_id. Disiscrivi/riscrivi = stesso event_id = un solo XP.
- **Crea/entra team** — ref_id = team_id. Esci/rientra = un solo XP.
- **Crea evento / annuncio / guida** — ref_id = id oggetto. Un solo XP per oggetto.

Nessun refund quando si annulla un'azione (per semplicità). L'XP guadagnato resta;
l'anti-farming impedisce solo di **ri-guadagnarlo**.

## 4. Logica Server — `src/lib/xp.ts`

### Costanti
- `RANK_THRESHOLDS` — array ordinato { rank, minXp, emoji }
- `XP_VALUES` — mappa azione → XP (in `constants.ts`)

### `calcRank(xp: number): string`
Pura. Restituisce il rank in base alle soglie.

### `awardXp(userId, actionType, refId, amount)` — server action idempotente
1. INSERT in `xp_events` (user_id, action_type, ref_id, amount, month_year) con `ON CONFLICT DO NOTHING`
2. Se l'insert NON ha creato righe (conflitto UNIQUE) → azione già premiata, **return** senza toccare l'XP
3. Se l'insert è andato a buon fine:
   - Legge `monthly_xp` corrente
   - `newXp = current + amount`
   - `newRank = calcRank(newXp)`
   - Update `profiles` con monthly_xp + current_rank
   - `revalidatePath("/ranking")`

L'idempotenza vive nel ledger (step 1-2), non nelle singole action. Le action chiamano
solo `awardXp(...)` e non devono preoccuparsi del doppio conteggio.

Usa admin/service client per scrivere su profilo di un altro utente (caso like → autore).
Idealmente l'intera operazione (insert ledger + update profilo) avviene in una funzione
Postgres `award_xp(...)` chiamata via RPC, così è atomica ed evita race condition.

## 5. Frontend

### Pagina `/ranking` (Server Component)
- Fetch top 50 profili ordinati per `monthly_xp` desc
- Tabella responsive, stile dark coerente col sito
- Badge colorato per ogni rank
- Emoji 🥇🥈🥉 per i primi 3 in classifica (posizione, non rank)
- Colonne: posizione, avatar+nome, rank badge, XP del mese

### Badge rank in navbar
- Accanto a `UserMenu` (alto destra), sia desktop che mobile
- Mostra emoji del `current_rank` dell'utente loggato
- Cliccabile → `/ranking`
- `getProfile()` già fa `select("*")` → `current_rank` disponibile senza modifiche

## Out of scope (per ora)
- Card classifica in homepage
- Badge rank nei profili pubblici
- Notifiche cambio rank
- Storico personale visibile all'utente (la tabella `ranking_history` viene popolata ma non ancora mostrata)
