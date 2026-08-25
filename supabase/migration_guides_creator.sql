-- ════════════════════════════════════════════════════════════════════
-- GUIDE: ruolo "creator" + video
-- Da eseguire nel SQL Editor. Idempotente.
--
-- Solo gli utenti con can_write_guides = true possono creare/modificare
-- guide. Tu assegni il ruolo a mano (vedi in fondo). Le guide pubblicate
-- restano leggibili da tutti.
-- ════════════════════════════════════════════════════════════════════

-- 1. Ruolo creator sul profilo + campo video sulle guide.
alter table public.profiles
  add column if not exists can_write_guides boolean not null default false;

alter table public.guides
  add column if not exists video_url text;

-- can_write_guides e' pubblico (serve al client per mostrare/nascondere il
-- bottone "Nuova guida"). Riconcede la SELECT su tutte le colonne del profilo
-- includendo la nuova.
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'profiles';
  revoke select on public.profiles from anon, authenticated;
  execute format('grant select (%s) on public.profiles to anon, authenticated', cols);
end $$;
grant select on public.profiles to service_role;


-- 2. RLS guide: lettura pubblica delle pubblicate; scrittura solo ai creator.
drop policy if exists "guides_read_published" on public.guides;
drop policy if exists "guides_write_author" on public.guides;

-- Legge: guide pubblicate a tutti, le proprie bozze all'autore.
create policy "guides_read" on public.guides
  for select using (
    published = true
    or auth.uid() = author_id
  );

-- Crea: solo un creator, e solo come autore di se stesso.
create policy "guides_insert_creator" on public.guides
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.can_write_guides = true
    )
  );

-- Modifica/elimina: solo l'autore (che deve restare creator).
create policy "guides_update_author" on public.guides
  for update using (
    auth.uid() = author_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.can_write_guides = true)
  ) with check (auth.uid() = author_id);

create policy "guides_delete_author" on public.guides
  for delete using (auth.uid() = author_id);


-- ════════════════════════════════════════════════════════════════════
-- ASSEGNARE IL RUOLO CREATOR (fallo tu, con l'username giusto):
--
--   update public.profiles set can_write_guides = true
--   where username = 'casellus';
--
-- Per togliere il ruolo:  set can_write_guides = false
-- ════════════════════════════════════════════════════════════════════
