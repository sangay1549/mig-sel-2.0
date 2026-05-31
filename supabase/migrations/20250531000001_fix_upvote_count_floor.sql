create or replace function public.toggle_feed_upvote(p_feed_id bigint)
returns table(new_upvote_count bigint, is_upvoted boolean)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_exists  boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select exists(
    select 1
    from public.community_feed_upvotes
    where feed_id = p_feed_id and user_id = v_user_id
  ) into v_exists;

  if v_exists then
    delete from public.community_feed_upvotes
    where feed_id = p_feed_id and user_id = v_user_id;

    update public.community_feed
    set upvote_count = greatest(0, upvote_count - 1)
    where id = p_feed_id;
  else
    insert into public.community_feed_upvotes (feed_id, user_id)
    values (p_feed_id, v_user_id);

    update public.community_feed
    set upvote_count = upvote_count + 1
    where id = p_feed_id;
  end if;

  return query
  select
    coalesce(f.upvote_count, 0)::bigint as new_upvote_count,
    not v_exists as is_upvoted
  from public.community_feed f
  where f.id = p_feed_id;
end;
$$;
