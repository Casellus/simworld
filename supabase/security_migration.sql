-- ════════════════════════════════════════════════════════════════════
-- SECURITY MIGRATION — SimUniverse
-- Da eseguire una volta nel SQL Editor di Supabase.
-- Idempotente: puo' essere rieseguita senza danni.
--
-- Copre: C6, C7, C14, C15, H5, H6, H7, H10, H11, M10, L21
-- ════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────
-- [C6][H10] SECURITY DEFINER functions: search_path fisso + niente
-- EXCEPTION handler che silenzia gli errori (creava utenti orfani).
-- ────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
  raw jsonb;
begin
  raw := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  base_username := coalesce(
    raw->>'username',
    raw->>'preferred_username',
    raw->>'user_name',
    raw->>'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'pilota_' || substr(new.id::text, 1, 6)
  );

  base_username := lower(regexp_replace(coalesce(base_username, ''), '[^a-z0-9_]', '', 'g'));
  if base_username is null or length(base_username) < 3 then
    base_username := 'pilota_' || substr(new.id::text, 1, 6);
  end if;

  final_username := base_username;
  while exists(select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(raw->>'full_name', raw->>'name', raw->>'global_name', final_username),
    raw->>'avatar_url'
  );

  return new;
  -- Nessun handler catch-all qui: un errore DEVE far fallire la creazione
  -- dell'utente, altrimenti resta un auth.users senza riga in profiles.
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


create or replace function public.handle_new_team()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.owner_id, 'proprietario')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_team_created on public.teams;
create trigger on_team_created
  after insert on public.teams
  for each row execute function public.handle_new_team();


-- ────────────────────────────────────────────────────────────────────
-- [H6] team_members: mancava la policy UPDATE → updateApplication()
-- faceva un upsert che falliva silenziosamente sul ramo UPDATE.
-- ────────────────────────────────────────────────────────────────────
drop policy if exists "team_members_update_owner" on public.team_members;
create policy "team_members_update_owner" on public.team_members
  for update
  using (exists(select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid()))
  with check (exists(select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid()));


-- ────────────────────────────────────────────────────────────────────
-- [M10] setup_comments: gli utenti non potevano modificare i propri commenti.
-- ────────────────────────────────────────────────────────────────────
drop policy if exists "comments_update_own" on public.setup_comments;
create policy "comments_update_own" on public.setup_comments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────────────
-- [L21] setup_votes: "for all" non ha with check → un utente poteva
-- inserire un voto a nome di un altro. Policy esplicite per comando.
-- ────────────────────────────────────────────────────────────────────
drop policy if exists "votes_write_own" on public.setup_votes;

drop policy if exists "votes_insert_own" on public.setup_votes;
create policy "votes_insert_own" on public.setup_votes
  for insert with check (auth.uid() = user_id);

drop policy if exists "votes_update_own" on public.setup_votes;
create policy "votes_update_own" on public.setup_votes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "votes_delete_own" on public.setup_votes;
create policy "votes_delete_own" on public.setup_votes
  for delete using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────────────
-- [H5] max_participants / registration_open / eventi passati non erano
-- enforceati a livello DB. Ora la with check li verifica: il controllo
-- applicativo in joinEvent() e' solo UX, questa e' la barriera vera.
-- ────────────────────────────────────────────────────────────────────
drop policy if exists "ep_insert_self" on public.event_participants;
create policy "ep_insert_self" on public.event_participants
  for insert with check (
    (
      auth.uid() = user_id
      or exists(select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
    )
    and exists (
      select 1 from public.events e
      where e.id = event_id
        and coalesce(e.registration_open, true) = true
        and coalesce(e.end_at, e.start_at) > now()
        and (
          e.max_participants is null
          or (
            select count(*) from public.event_participants p where p.event_id = e.id
          ) < e.max_participants
        )
    )
  );


-- ────────────────────────────────────────────────────────────────────
-- [C14] RLS su team_applications e notifications.
-- Le tabelle sono state create dalla dashboard e non esistono in
-- schema.sql: le guardie to_regclass evitano errori se mancano.
-- ────────────────────────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.notifications') is not null then
    execute 'alter table public.notifications enable row level security';

    execute 'drop policy if exists "notifications_select_own" on public.notifications';
    execute 'create policy "notifications_select_own" on public.notifications
               for select using (auth.uid() = user_id)';

    -- Solo l''owner puo' marcarle come lette.
    execute 'drop policy if exists "notifications_update_own" on public.notifications';
    execute 'create policy "notifications_update_own" on public.notifications
               for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';

    execute 'drop policy if exists "notifications_delete_own" on public.notifications';
    execute 'create policy "notifications_delete_own" on public.notifications
               for delete using (auth.uid() = user_id)';

    -- INSERT: nessuna policy per i client. Le notifiche vengono create dai
    -- server action, che devono usare il service role (bypassa RLS).
    execute 'drop policy if exists "notifications_insert_authed" on public.notifications';
  end if;
end $$;

do $$
begin
  if to_regclass('public.team_applications') is not null then
    execute 'alter table public.team_applications enable row level security';

    -- Legge la candidatura: il candidato stesso o il proprietario del team.
    execute 'drop policy if exists "ta_select_self_or_owner" on public.team_applications';
    execute 'create policy "ta_select_self_or_owner" on public.team_applications
               for select using (
                 auth.uid() = user_id
                 or exists(select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
               )';

    -- Si candida solo per se stesso, e solo a team che reclutano.
    execute 'drop policy if exists "ta_insert_self" on public.team_applications';
    execute 'create policy "ta_insert_self" on public.team_applications
               for insert with check (
                 auth.uid() = user_id
                 and exists(select 1 from public.teams t where t.id = team_id and t.recruiting = true)
               )';

    -- Accetta/rifiuta: solo il proprietario del team.
    execute 'drop policy if exists "ta_update_owner" on public.team_applications';
    execute 'create policy "ta_update_owner" on public.team_applications
               for update using (
                 exists(select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
               ) with check (
                 exists(select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
               )';

    -- Ritira la candidatura: il candidato o il proprietario.
    execute 'drop policy if exists "ta_delete_self_or_owner" on public.team_applications';
    execute 'create policy "ta_delete_self_or_owner" on public.team_applications
               for delete using (
                 auth.uid() = user_id
                 or exists(select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid())
               )';
  end if;
end $$;


-- ────────────────────────────────────────────────────────────────────
-- [H7] incrementDownload: era select-then-update (race condition) e
-- senza auth. UPDATE atomico, SECURITY DEFINER per bypassare la
-- setups_update_own (che permette l'update solo al proprietario).
-- ────────────────────────────────────────────────────────────────────
create or replace function public.increment_download(p_setup_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Solo utenti autenticati: auth.uid() e' null per anon.
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  update public.setups
  set downloads = coalesce(downloads, 0) + 1
  where id = p_setup_id;
end;
$$;

revoke all on function public.increment_download(uuid) from public, anon;
grant execute on function public.increment_download(uuid) to authenticated, service_role;


-- ────────────────────────────────────────────────────────────────────
-- [H11] award_xp: cap giornaliero per utente. Il ledger UNIQUE impedisce
-- i duplicati sullo stesso ref_id, ma non il farming con ref_id diversi.
-- ────────────────────────────────────────────────────────────────────
create or replace function public.award_xp(
  p_user_id uuid,
  p_action_type text,
  p_ref_id text,
  p_amount integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month text := to_char(now(), 'YYYY-MM');
  v_today_xp integer;
  v_daily_cap constant integer := 500;
begin
  -- Rifiuta amount fuori range (difesa contro chiamate dirette col service role).
  if p_amount is null or p_amount <= 0 or p_amount > 100 then
    raise exception 'invalid xp amount: %', p_amount;
  end if;

  -- Cap giornaliero: somma dell'XP gia' assegnato oggi a questo utente.
  select coalesce(sum(amount), 0) into v_today_xp
  from public.xp_events
  where user_id = p_user_id
    and created_at >= date_trunc('day', now());

  if v_today_xp + p_amount > v_daily_cap then
    -- Cap raggiunto: non assegna XP ma non fa fallire l'azione utente.
    return;
  end if;

  insert into public.xp_events (user_id, action_type, ref_id, amount, month_year)
  values (p_user_id, p_action_type, p_ref_id, p_amount, v_month)
  on conflict (user_id, action_type, ref_id) do nothing;

  if not found then
    return;
  end if;

  update public.profiles
  set monthly_xp = monthly_xp + p_amount,
      current_rank = public.calc_rank(monthly_xp + p_amount)
  where id = p_user_id;
end;
$$;

-- award_xp/revoke_xp sono chiamate solo dal server (service role):
-- nessun client, autenticato o meno, deve poterle invocare direttamente.
revoke all on function public.award_xp(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.award_xp(uuid, text, text, integer) to service_role;

-- revoke_xp e' definita in docs/superpowers/sql/ranking-setup.sql: se quel
-- file non e' mai stato eseguito la funzione non esiste ancora.
do $$
begin
  revoke all on function public.revoke_xp(uuid, text, text) from public, anon, authenticated;
  grant execute on function public.revoke_xp(uuid, text, text) to service_role;
exception when undefined_function then
  raise warning 'public.revoke_xp non esiste: esegui prima docs/superpowers/sql/ranking-setup.sql';
end $$;


-- ────────────────────────────────────────────────────────────────────
-- [C7][C8][C9] STORAGE
--
-- 1. MIME whitelist a livello bucket: blocca SVG/HTML/PHP all'origine.
--    Questa e' la barriera vera contro lo stored XSS — la validazione
--    client-side (src/lib/upload.ts) e' solo UX.
-- 2. RLS su storage.objects: si scrive solo dentro la propria cartella
--    (primo segmento del path = auth.uid()).
--
-- NOTA: i bucket restano public-read. Renderli privati richiede di
-- servire ogni immagine via signed URL (refactor applicativo esteso).
-- Vedi la sezione "PASSO SUCCESSIVO" in fondo al file.
-- ────────────────────────────────────────────────────────────────────

-- storage.objects ha gia' RLS attivo di default su Supabase e appartiene a
-- supabase_storage_admin: un "alter table ... enable row level security"
-- fallirebbe con 42501. Non serve.

-- Limiti e MIME per i bucket. Se il ruolo del SQL Editor non ha i permessi
-- su storage.buckets, l'update viene saltato con un avviso: in quel caso
-- impostali a mano da Dashboard → Storage → <bucket> → Settings.
do $$
begin
  update storage.buckets
  set allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'],
      file_size_limit    = 5242880  -- 5 MB
  where id in ('avatars', 'event-banners', 'team-assets', 'Team-assets');

  -- Il bucket "setups" contiene sia file assetto sia foto (prefisso photos/).
  update storage.buckets
  set allowed_mime_types = array[
        'image/png','image/jpeg','image/webp','image/gif',
        'application/json','application/xml','text/xml','text/plain',
        'application/zip','application/octet-stream'
      ],
      file_size_limit = 5242880
  where id = 'setups';
exception when insufficient_privilege then
  raise warning 'Nessun permesso su storage.buckets: imposta MIME e size limit dalla Dashboard.';
end $$;

-- Lettura pubblica (i bucket sono public).
drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects
  for select using (
    bucket_id in ('setups','avatars','event-banners','team-assets','Team-assets')
  );

-- Scrittura: solo autenticati, solo nella propria cartella.
-- I path usati dall'app sono "<uid>/..." oppure "photos/<uid>/..." (setups).
drop policy if exists "storage_insert_own_folder" on storage.objects;
create policy "storage_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('setups','avatars','event-banners','team-assets','Team-assets')
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        bucket_id = 'setups'
        and (storage.foldername(name))[1] = 'photos'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

drop policy if exists "storage_update_own_folder" on storage.objects;
create policy "storage_update_own_folder" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('setups','avatars','event-banners','team-assets','Team-assets')
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        bucket_id = 'setups'
        and (storage.foldername(name))[1] = 'photos'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

drop policy if exists "storage_delete_own_folder" on storage.objects;
create policy "storage_delete_own_folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('setups','avatars','event-banners','team-assets','Team-assets')
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        bucket_id = 'setups'
        and (storage.foldername(name))[1] = 'photos'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );


-- ════════════════════════════════════════════════════════════════════
-- PASSO SUCCESSIVO (richiede modifiche applicative, non incluso qui)
--
-- Per chiudere del tutto C7 ("file leggibili per sempre da chiunque
-- abbia l'URL"), i bucket vanno resi privati:
--
--   update storage.buckets set public = false where id in (...);
--   drop policy "storage_public_read" on storage.objects;
--
-- e ogni getPublicUrl() va sostituito con createSignedUrl() servito da
-- un endpoint server che verifica l'autorizzazione. Impatta: avatar,
-- cover, banner eventi, loghi team, foto assetti, download assetti.
-- ════════════════════════════════════════════════════════════════════
