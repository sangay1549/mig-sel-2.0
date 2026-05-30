-- Fix update_user_role to also update auth.users.raw_app_meta_data
-- so the user's session JWT reflects the new role immediately.

drop function if exists public.update_user_role(p_email text, p_role text);

create or replace function public.update_user_role(p_email text, p_role text)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = p_email;
  if v_user_id is null then
    raise exception 'User not found';
  end if;

  update public.profiles
  set role = p_role
  where id = v_user_id;

  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', p_role)
  where id = v_user_id;
end;
$$;
