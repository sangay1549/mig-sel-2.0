-- Recreate handle_new_user() with fully qualified names
-- The previous fix (00004) used unqualified 'profiles.username' in the
-- ON CONFLICT clause, which may silently fail with set search_path = ''.
-- Phantom migrations on remote may also have overwritten the fix.

-- Drop existing trigger first (safe, IF EXISTS)
drop trigger if exists on_auth_user_created on auth.users;

-- Drop existing function (safe, IF EXISTS)
drop function if exists public.handle_new_user();

-- Drop column default on role if any (prevents accidental 'user' inserts)
alter table public.profiles
  alter column role drop default;

-- Recreate the function with fully qualified names everywhere
create function public.handle_new_user()
returns trigger
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, points, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'preferred_username',
      split_part(new.email, '@', 1),
      'User'
    ),
    0,
    null
  )
  on conflict (id) do update
  set username = coalesce(
    excluded.username,
    public.profiles.username
  );
  return new;
end;
$$ language plpgsql;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fix any existing profiles that still have role = 'user'
update public.profiles set role = null where role = 'user';
