-- Fix handle_new_user trigger: more robust to OAuth providers (Discord, etc)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
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
exception when others then
  raise log 'handle_new_user error: % %', sqlerrm, sqlstate;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
