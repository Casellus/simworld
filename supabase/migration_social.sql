-- ════════════════════════════════════════════════════════════════════
-- SOCIAL LINKS — aggiunge twitch e instagram al profilo
-- Da eseguire nel SQL Editor. Idempotente.
-- discord_id e steam_id esistono gia'.
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists twitch text,
  add column if not exists instagram text;

-- Le nuove colonne devono essere leggibili pubblicamente come le altre
-- colonne del profilo (i link social sono pubblici by design). Le colonne
-- private (discord_id/steam_id NON lo sono piu' — vedi nota sotto).
--
-- NOTA: security_migration_2.sql aveva revocato la SELECT su discord_id e
-- steam_id ad anon/authenticated (contatti privati). Ora che diventano
-- social pubblici mostrati sul profilo, li ri-rendiamo leggibili a tutti,
-- insieme a twitch e instagram.
do $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'profiles';

  -- Riconcede la SELECT su TUTTE le colonne (i social sono pubblici).
  revoke select on public.profiles from anon, authenticated;
  execute format('grant select (%s) on public.profiles to anon, authenticated', cols);
end $$;

grant select on public.profiles to service_role;
