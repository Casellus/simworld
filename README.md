# SimUniverse

Hub italiano del sim racing — tornei, team, assetti, guide per ACC, iRacing, LMU, AC, AC EVO, F1 25.

Stack: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · Supabase.

## Dev

```bash
npm install
npm run dev
```

http://localhost:3000

## Setup Supabase (prima volta)

### 1. Schema DB
SQL Editor → incolla `supabase/schema.sql` → Run.

### 2. Storage buckets (public)
- `setups`
- `avatars`
- `team-assets`
- `event-banners`

### 3. Auth providers
Authentication → Providers:
- **Email** abilita
- **Discord** abilita
  - https://discord.com/developers/applications → New App
  - OAuth2 redirect: `https://<project>.supabase.co/auth/v1/callback`
  - Client ID + Secret → Supabase Discord provider

### 4. Auth URL Configuration
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

## Moduli MVP

- **Eventi** (`/eventi`) — crea, lista filtrata, iscrizione
- **Team** (`/team`) — crea, lista, roster, recruiting flag
- **Assetti** (`/assetti`) — upload file 5MB max, voti, download counter
- **Cerca** (`/cerca`) — bacheca cerca pilota / cerca team
- **Guide** (`/guide`) — articoli (popolare via Supabase dashboard nel MVP)
- **Profilo** (`/profilo/[username]`) + **Dashboard** (`/dashboard`)

## Struttura

```
src/app/         App Router routes
src/components/  header, footer, ui/
src/lib/
  supabase/      client browser + server + proxy session
  auth.ts        getUser, requireUser
  constants.ts   GAMES, EVENT_TYPES, SKILL_LEVELS
  types.ts       one() helper per relazioni nested
  utils.ts       cn, slugify, formatDate
proxy.ts         Next.js 16 (ex middleware)
supabase/schema.sql
```

## Note Next.js 16

- `middleware` → `proxy.ts`
- `params`, `searchParams`, `cookies()`, `headers()` async
- Turbopack default

## Deploy

Vercel → import repo → env vars → deploy.
Aggiorna Supabase Auth Site URL + Redirect URLs con dominio prod.
