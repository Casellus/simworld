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

-- 5b. revoke_xp: annulla un'assegnazione (azione cancellata) — toglie XP, blocca a 0
create or replace function public.revoke_xp(
  p_user_id uuid,
  p_action_type text,
  p_ref_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount integer;
  v_new_xp integer;
begin
  -- rimuove la riga del ledger e recupera l'amount assegnato
  delete from public.xp_events
  where user_id = p_user_id and action_type = p_action_type and ref_id = p_ref_id
  returning amount into v_amount;

  -- se non c'era nessuna assegnazione → niente da togliere
  if v_amount is null then
    return;
  end if;

  -- sottrae XP, mai sotto 0, ricalcola rank
  update public.profiles
  set monthly_xp = greatest(0, monthly_xp - v_amount),
      current_rank = public.calc_rank(greatest(0, monthly_xp - v_amount))
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
