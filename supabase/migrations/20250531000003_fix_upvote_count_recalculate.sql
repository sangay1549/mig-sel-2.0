-- Fix upvote count: replace counter arithmetic with authoritative recalculation
-- from the junction table after each toggle.
--
-- The previous approach (greatest(0, upvote_count +/- 1)) could silently
-- produce wrong counts if the initial state was drifted or if SELECT ... FOR UPDATE
-- didn't lock as expected in certain edge cases (e.g. feed row deleted mid-toggle).
--
-- This version recalculates upvote_count = COUNT(*) from community_feed_upvotes
-- after every toggle, guaranteeing accuracy regardless of initial state or concurrency.

create or replace function public.toggle_feed_upvote(p_feed_id bigint)
returns table(new_upvote_count bigint, is_upvoted boolean)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_feed_exists boolean;
  v_upvoted boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Lock the feed row + validate it exists
  select true into v_feed_exists
  from public.community_feed
  where id = p_feed_id
  for update;

  if not v_feed_exists then
    raise exception 'Feed entry with id % not found', p_feed_id;
  end if;

  -- Toggle: if already upvoted → remove, otherwise → add
  if exists (
    select 1 from public.community_feed_upvotes
    where feed_id = p_feed_id and user_id = v_user_id
  ) then
    delete from public.community_feed_upvotes
    where feed_id = p_feed_id and user_id = v_user_id;
    v_upvoted := false;
  else
    insert into public.community_feed_upvotes (feed_id, user_id)
    values (p_feed_id, v_user_id);
    v_upvoted := true;
  end if;

  -- Recalculate upvote_count from the junction table (always authoritative)
  update public.community_feed
  set upvote_count = (
    select count(*)::bigint
    from public.community_feed_upvotes
    where feed_id = p_feed_id
  )
  where id = p_feed_id;

  return query
  select
    f.upvote_count::bigint as new_upvote_count,
    v_upvoted as is_upvoted
  from public.community_feed f
  where f.id = p_feed_id;
end;
$$;
