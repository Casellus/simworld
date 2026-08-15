-- ════════════════════════════════════════════════════════════════════
-- RATE LIMITING — sliding window su Postgres
-- Da eseguire nel SQL Editor. Idempotente.
--
-- Nessuna dipendenza esterna: usa il DB gia' esistente. La funzione
-- check_rate_limit e' atomica (un solo statement con upsert) e
-- SECURITY DEFINER, cosi' i client non toccano mai la tabella
-- direttamente.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.rate_limits (
  bucket      text        not null,   -- es. "login", "forgot_password"
  identifier  text        not null,   -- es. IP o user_id
  window_start timestamptz not null,
  count       integer     not null default 0,
  primary key (bucket, identifier, window_start)
);

-- Pulizia delle finestre vecchie: indice per la delete periodica.
create index if not exists rate_limits_window_idx
  on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;
-- Nessuna policy: nessun accesso client diretto. Solo la funzione
-- SECURITY DEFINER e il service role leggono/scrivono.


-- ────────────────────────────────────────────────────────────────────
-- check_rate_limit: incrementa il contatore della finestra corrente e
-- restituisce true se la richiesta e' ENTRO il limite, false se va
-- bloccata.
--
--   p_bucket      categoria dell'azione (login, forgot_password, ...)
--   p_identifier  chi la compie (IP, user_id)
--   p_max         richieste massime nella finestra
--   p_window_secs ampiezza della finestra in secondi
--
-- Finestra "fixed window" arrotondata: semplice, atomica, sufficiente
-- contro brute-force e abuso. Il conteggio parte da 1 sulla prima
-- richiesta della finestra.
-- ────────────────────────────────────────────────────────────────────
create or replace function public.check_rate_limit(
  p_bucket text,
  p_identifier text,
  p_max integer,
  p_window_secs integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count  integer;
begin
  -- inizio della finestra corrente (troncata all'ampiezza)
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_secs) * p_window_secs
  );

  insert into public.rate_limits (bucket, identifier, window_start, count)
  values (p_bucket, p_identifier, v_window, 1)
  on conflict (bucket, identifier, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, text, integer, integer)
  from public, anon;
-- Chiamata dai server action: authenticated (utente loggato) e
-- service_role. anon NON puo' invocarla (i flussi anonimi come login
-- passano da un server action che gira col contesto della richiesta).
grant execute on function public.check_rate_limit(text, text, integer, integer)
  to authenticated, service_role;


-- ────────────────────────────────────────────────────────────────────
-- Pulizia: rimuove le finestre piu' vecchie di 1 giorno.
-- Se pg_cron e' disponibile la schedula, altrimenti la si puo'
-- chiamare a mano ogni tanto: select public.cleanup_rate_limits();
-- ────────────────────────────────────────────────────────────────────
create or replace function public.cleanup_rate_limits()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.rate_limits
  where window_start < now() - interval '1 day';
$$;

do $$
begin
  perform cron.schedule(
    'cleanup-rate-limits',
    '0 * * * *',                      -- ogni ora
    $cron$ select public.cleanup_rate_limits(); $cron$
  );
exception when undefined_function or undefined_table then
  raise warning 'pg_cron non disponibile: chiama cleanup_rate_limits() manualmente.';
end $$;
