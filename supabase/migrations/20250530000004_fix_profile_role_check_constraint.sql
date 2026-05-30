-- Fix profiles_role_check constraint violation on new user signup
-- The handle_new_user() trigger was inserting role='user', which violates
-- the check constraint that only allows admin, inspector, official.

-- Update the trigger function to use NULL for regular users instead of 'user'
create or replace function public.handle_new_user()
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
    profiles.username
  );
  return new;
end;
$$ language plpgsql;

-- Fix any existing profiles that have role='user' crated before this fix
update public.profiles set role = null where role = 'user';
