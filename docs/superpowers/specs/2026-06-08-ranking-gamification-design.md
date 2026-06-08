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

### Reset mensile — pg_cron
Job schedulato il 1° del mese alle 00:00:
1. Inserisce snapshot di ogni profilo in `ranking_history` (month_year = mese appena concluso, xp_earned = monthly_xp, final_rank = current_rank)
2. Azzera `monthly_xp = 0` e `current_rank = 'Bronzo'` per tutti i profili

Solo profili con `monthly_xp > 0` vengono archiviati (no righe vuote).

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

**Anti-farming:** l'XP a chi vota si conta una sola volta per coppia (utente, assetto).
Togliere e rimettere il like non genera nuovo XP. Si traccia con una colonna
`xp_awarded` boolean su `setup_votes` (o tabella ledger): XP dato solo al primo voto +1.
Stessa regola per l'autore — XP all'autore solo al primo +1 di quel votante su quell'assetto.

## 4. Logica Server — `src/lib/xp.ts`

### Costanti
- `RANK_THRESHOLDS` — array ordinato { rank, minXp, emoji }
- `XP_VALUES` — mappa azione → XP (in `constants.ts`)

### `calcRank(xp: number): string`
Pura. Restituisce il rank in base alle soglie.

### `awardXp(userId: string, amount: number)` — server action
1. Legge `monthly_xp` corrente
2. `newXp = current + amount`
3. `newRank = calcRank(newXp)`
4. Update `profiles` con monthly_xp + current_rank
5. `revalidatePath("/ranking")`

Usa admin/service client per scrivere su profilo di un altro utente (caso like → autore).

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
