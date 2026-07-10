-- ════════════════════════════════════════════════════════════════════
-- SECURITY MIGRATION 2 — dati di contatto in profiles
-- Da eseguire dopo security_migration.sql. Idempotente.
--
-- Problema: la policy "profiles_read_all" (using true) rende profiles
-- leggibile a chiunque, anche senza login. Con la sola anon key —
-- che e' pubblica, sta nel bundle JS — si potevano scaricare email,
-- discord_id e steam_id di tutti gli utenti:
--
--   curl "$URL/rest/v1/profiles?select=email,discord_id,steam_id" \
--        -H "apikey: $ANON_KEY"
--
-- La RLS e' row-level: non puo' nascondere singole colonne. Servono
-- i privilegi per colonna.
-- ════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────
-- 1. profiles.email — duplicava auth.users (che NON e' esposta via API).
--    L'unico consumatore era checkEmailExists(), gia' rimosso perche'
--    permetteva l'enumerazione degli utenti.
-- ────────────────────────────────────────────────────────────────────
alter table public.profiles drop column if exists email;


-- ────────────────────────────────────────────────────────────────────
-- 2. discord_id / steam_id — via la SELECT ad anon e authenticated.
--
--    Attenzione: "revoke select (colonna)" non ha effetto se il ruolo
--    possiede la SELECT a livello di tabella. Va tolta la SELECT sulla
--    tabella e riconcessa solo sulle colonne pubbliche.
--
--    L'elenco delle colonne e' costruito a runtime, cosi' una colonna
--    aggiunta in futuro resta pubblica per default senza rompere nulla
--    (le due private sono esplicitamente escluse).
-- ────────────────────────────────────────────────────────────────────
do $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name   = 'profiles'
    and column_name not in ('discord_id', 'steam_id');

  revoke select on public.profiles from anon, authenticated;
  execute format('grant select (%s) on public.profiles to anon, authenticated', cols);
end $$;

-- service_role (client admin lato server) mantiene l'accesso completo.
grant select on public.profiles to service_role;


-- ────────────────────────────────────────────────────────────────────
-- 3. Il proprietario deve poter leggere i PROPRI contatti (pagina
--    impostazioni e proprio profilo). SECURITY DEFINER limitata a
--    auth.uid(): non c'e' modo di leggere quelli di un altro utente.
-- ────────────────────────────────────────────────────────────────────
create or replace function public.my_contacts()
returns table (discord_id text, steam_id text)
language sql
security definer
set search_path = ''
stable
as $$
  select p.discord_id, p.steam_id
  from public.profiles p
  where p.id = auth.uid();
$$;

revoke all on function public.my_contacts() from public, anon;
grant execute on function public.my_contacts() to authenticated, service_role;


-- ────────────────────────────────────────────────────────────────────
-- Nota: la UPDATE non e' toccata. updateProfile() continua a scrivere
-- discord_id/steam_id: e' la SELECT a essere ristretta, non la scrittura,
-- e la policy profiles_update_own limita gia' la riga a auth.uid() = id.
-- ────────────────────────────────────────────────────────────────────
