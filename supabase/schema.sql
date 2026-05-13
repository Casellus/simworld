-- SimWorld schema
-- Run in Supabase SQL editor (Project → SQL editor → new query → paste → run)

-- Extensions
create extension if not exists "uuid-ossp";

-- ============ PROFILES ============
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text,
  country text default 'IT',
  bio text,
  avatar_url text,
  hardware text,
  discord_id text,
  steam_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ GAMES ============
create table if not exists games (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  icon_url text
);

insert into games (slug, name) values
  ('acc', 'Assetto Corsa Competizione'),
  ('iracing', 'iRacing'),
  ('lmu', 'Le Mans Ultimate'),
  ('ac', 'Assetto Corsa'),
  ('ac-evo', 'Assetto Corsa EVO'),
  ('f1-25', 'F1 25')
on conflict (slug) do nothing;

-- ============ USER GAMES ============
create table if not exists user_games (
  user_id uuid references profiles(id) on delete cascade,
  game_id uuid references games(id) on delete cascade,
  skill_level text check (skill_level in ('principiante','intermedio','avanzato','pro')),
  primary key (user_id, game_id)
);

-- ============ TEAMS ============
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  logo_url text,
  banner_url text,
  description text,
  owner_id uuid references profiles(id) on delete cascade not null,
  recruiting boolean default false,
  country text default 'IT',
  created_at timestamptz default now()
);

create table if not exists team_members (
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'pilota' check (role in ('proprietario','manager','pilota','riserva')),
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

create table if not exists team_games (
  team_id uuid references teams(id) on delete cascade,
  game_id uuid references games(id) on delete cascade,
  primary key (team_id, game_id)
);

-- ============ EVENTS ============
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  host_user_id uuid references profiles(id) on delete set null,
  host_team_id uuid references teams(id) on delete set null,
  game_id uuid references games(id),
  event_type text check (event_type in ('torneo','amichevole','campionato','endurance','sprint')),
  format text,
  track text,
  car_class text,
  start_at timestamptz not null,
  end_at timestamptz,
  max_participants int,
  registration_open boolean default true,
  banner_url text,
  created_at timestamptz default now()
);

create table if not exists event_participants (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  status text default 'iscritto' check (status in ('iscritto','confermato','rifiutato','riserva')),
  created_at timestamptz default now(),
  unique (event_id, user_id, team_id)
);

-- ============ SETUPS ============
create table if not exists setups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  game_id uuid references games(id) not null,
  title text not null,
  car text not null,
  track text not null,
  conditions text,
  notes text,
  file_url text,
  downloads int default 0,
  rating_sum int default 0,
  rating_count int default 0,
  created_at timestamptz default now()
);

create table if not exists setup_votes (
  setup_id uuid references setups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  value int check (value in (1,-1)),
  primary key (setup_id, user_id)
);

create table if not exists setup_comments (
  id uuid primary key default uuid_generate_v4(),
  setup_id uuid references setups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- ============ RECRUITMENT ============
create table if not exists recruitment_posts (
  id uuid primary key default uuid_generate_v4(),
  post_type text check (post_type in ('cerca_team','cerca_pilota')) not null,
  user_id uuid references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  game_id uuid references games(id),
  title text not null,
  description text not null,
  contact text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============ GUIDES ============
create table if not exists guides (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body text not null,
  category text,
  game_id uuid references games(id),
  author_id uuid references profiles(id) on delete set null,
  cover_url text,
  published boolean default false,
  created_at timestamptz default now()
);

-- ============ INDEXES ============
create index if not exists events_start_idx on events(start_at desc);
create index if not exists events_game_idx on events(game_id);
create index if not exists setups_game_idx on setups(game_id);
create index if not exists setups_car_track_idx on setups(car, track);
create index if not exists recruitment_active_idx on recruitment_posts(active, created_at desc);

-- ============ RLS ============
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table team_games enable row level security;
alter table events enable row level security;
alter table event_participants enable row level security;
alter table setups enable row level security;
alter table setup_votes enable row level security;
alter table setup_comments enable row level security;
alter table recruitment_posts enable row level security;
alter table user_games enable row level security;
alter table guides enable row level security;

-- profiles policies
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- teams policies
create policy "teams_read_all" on teams for select using (true);
create policy "teams_insert_authed" on teams for insert with check (auth.uid() = owner_id);
create policy "teams_update_owner" on teams for update using (auth.uid() = owner_id);
create policy "teams_delete_owner" on teams for delete using (auth.uid() = owner_id);

-- team_members
create policy "team_members_read_all" on team_members for select using (true);
create policy "team_members_insert_owner" on team_members for insert with check (
  exists(select 1 from teams t where t.id = team_id and t.owner_id = auth.uid())
);
create policy "team_members_delete_owner_or_self" on team_members for delete using (
  auth.uid() = user_id or exists(select 1 from teams t where t.id = team_id and t.owner_id = auth.uid())
);

-- team_games
create policy "team_games_read_all" on team_games for select using (true);
create policy "team_games_write_owner" on team_games for all using (
  exists(select 1 from teams t where t.id = team_id and t.owner_id = auth.uid())
);

-- events policies
create policy "events_read_all" on events for select using (true);
create policy "events_insert_authed" on events for insert with check (auth.uid() = host_user_id);
create policy "events_update_host" on events for update using (auth.uid() = host_user_id);
create policy "events_delete_host" on events for delete using (auth.uid() = host_user_id);

-- event_participants
create policy "ep_read_all" on event_participants for select using (true);
create policy "ep_insert_self" on event_participants for insert with check (
  auth.uid() = user_id or exists(select 1 from teams t where t.id = team_id and t.owner_id = auth.uid())
);
create policy "ep_delete_self_or_host" on event_participants for delete using (
  auth.uid() = user_id
  or exists(select 1 from teams t where t.id = team_id and t.owner_id = auth.uid())
  or exists(select 1 from events e where e.id = event_id and e.host_user_id = auth.uid())
);

-- setups
create policy "setups_read_all" on setups for select using (true);
create policy "setups_insert_own" on setups for insert with check (auth.uid() = user_id);
create policy "setups_update_own" on setups for update using (auth.uid() = user_id);
create policy "setups_delete_own" on setups for delete using (auth.uid() = user_id);

-- setup_votes
create policy "votes_read_all" on setup_votes for select using (true);
create policy "votes_write_own" on setup_votes for all using (auth.uid() = user_id);

-- setup_comments
create policy "comments_read_all" on setup_comments for select using (true);
create policy "comments_insert_own" on setup_comments for insert with check (auth.uid() = user_id);
create policy "comments_delete_own" on setup_comments for delete using (auth.uid() = user_id);

-- recruitment_posts
create policy "rp_read_all" on recruitment_posts for select using (true);
create policy "rp_insert_own" on recruitment_posts for insert with check (
  auth.uid() = user_id or exists(select 1 from teams t where t.id = team_id and t.owner_id = auth.uid())
);
create policy "rp_update_own" on recruitment_posts for update using (
  auth.uid() = user_id or exists(select 1 from teams t where t.id = team_id and t.owner_id = auth.uid())
);
create policy "rp_delete_own" on recruitment_posts for delete using (
  auth.uid() = user_id or exists(select 1 from teams t where t.id = team_id and t.owner_id = auth.uid())
);

-- user_games
create policy "ug_read_all" on user_games for select using (true);
create policy "ug_write_own" on user_games for all using (auth.uid() = user_id);

-- guides
create policy "guides_read_published" on guides for select using (published = true or auth.uid() = author_id);
create policy "guides_write_author" on guides for all using (auth.uid() = author_id);

-- games readable to all (no insert via app)
alter table games enable row level security;
create policy "games_read_all" on games for select using (true);

-- ============ TRIGGERS ============
-- auto-create profile when user signs up
create or replace function handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'pilota_' || substr(new.id::text, 1, 6)
  );
  base_username := lower(regexp_replace(base_username, '[^a-z0-9_]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'pilota_' || substr(new.id::text, 1, 6);
  end if;
  final_username := base_username;
  while exists(select 1 from profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;
  insert into profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', final_username),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- auto-add team owner as member
create or replace function handle_new_team()
returns trigger as $$
begin
  insert into team_members (team_id, user_id, role)
  values (new.id, new.owner_id, 'proprietario')
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_team_created on teams;
create trigger on_team_created
  after insert on teams
  for each row execute function handle_new_team();

-- ============ STORAGE BUCKETS ============
-- Run separately in Supabase Dashboard → Storage:
-- 1. Create bucket "setups" (public)
-- 2. Create bucket "avatars" (public)
-- 3. Create bucket "team-assets" (public)
-- 4. Create bucket "event-banners" (public)
