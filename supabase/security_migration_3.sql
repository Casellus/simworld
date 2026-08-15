-- setups.notes esce via API REST a un anonimo, nonostante la UI le nasconda
-- ("Accedi per leggere le note"). Stesso pattern di profiles.discord/steam:
-- la RLS filtra righe, non colonne. Togliamo la SELECT su "notes" al ruolo
-- anon; authenticated la mantiene (il gate della UI e' proprio "sei loggato").
--
-- La revoca per colonna non basta se anon ha la SELECT a livello tabella:
-- va tolta la tabella e riconcessa su tutte le colonne TRANNE notes.
do $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name   = 'setups'
    and column_name <> 'notes';

  revoke select on public.setups from anon;
  execute format('grant select (%s) on public.setups to anon', cols);
end $$;

-- authenticated e service_role leggono tutto (incluse le note).
grant select on public.setups to authenticated, service_role;

select 'notes leggibile da anon?' as verifica,
  case when exists (
    select 1 from information_schema.column_privileges
    where table_schema='public' and table_name='setups'
      and column_name='notes' and privilege_type='SELECT' and grantee='anon'
  ) then '❌ ANCORA' else '✅ NO' end as stato
union all
select 'title leggibile da anon? (deve restare)',
  case when exists (
    select 1 from information_schema.column_privileges
    where table_schema='public' and table_name='setups'
      and column_name='title' and privilege_type='SELECT' and grantee='anon'
  ) then '✅ SI' else '❌ ROTTO' end;
