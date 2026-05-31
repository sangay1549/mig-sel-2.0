-- Fix race condition in toggle_feed_upvote that causes upvote counts
-- to change by +2/-2 instead of +1/-1.
--
-- Root cause: the old function used a non-atomic "SELECT EXISTS then INSERT/DELETE"
-- pattern (TOCTOU). Two concurrent calls could both read v_exists=false before
-- either INSERT commits, resulting in two rows in community_feed_upvotes and
-- two increments of upvote_count.
--
-- Fix:
--   1. Deduplicate existing rows in community_feed_upvotes
--   2. Add a UNIQUE constraint on (feed_id, user_id) to prevent duplicates
--   3. Recalculate upvote_count from actual upvotes to fix any drift
--   4. Rewrite toggle_feed_upvote using INSERT ... ON CONFLICT (atomic upsert)
--      + SELECT ... FOR UPDATE on the feed row for full serialization

-- Step 1: Remove duplicate entries — keep only the earliest ctid per (feed_id, user_id)
delete from public.community_feed_upvotes
where ctid not in (
    select min(ctid)
    from public.community_feed_upvotes
    group by feed_id, user_id
);

-- Step 2: Add UNIQUE constraint (prevents data corruption going forward)
alter table public.community_feed_upvotes
add constraint community_feed_upvotes_feed_user_unique
unique (feed_id, user_id);

-- Step 3: Fix any drifted upvote_counts by recalculating from actual upvotes
update public.community_feed f
set upvote_count = (
    select count(*)
    from public.community_feed_upvotes u
    where u.feed_id = f.id
)
where f.upvote_count <> (
    select count(*)
    from public.community_feed_upvotes u
    where u.feed_id = f.id
);

-- Step 4: Rewrite toggle function with atomic INSERT ... ON CONFLICT + row locking
create or replace function public.toggle_feed_upvote(p_feed_id bigint)
returns table(new_upvote_count bigint, is_upvoted boolean)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_inserted boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Lock the feed row to serialize concurrent toggle calls for this feed.
  -- Without this, two concurrent calls could both enter the same branch
  -- (both delete or both insert) and corrupt the count.
  perform 1
  from public.community_feed
  where id = p_feed_id
  for update;

  -- Atomically try to insert. If the row already exists (unique conflict),
  -- nothing is inserted and found is set to false.
  insert into public.community_feed_upvotes (feed_id, user_id)
  values (p_feed_id, v_user_id)
  on conflict (feed_id, user_id) do nothing;

  v_inserted := found;

  if v_inserted then
    update public.community_feed
    set upvote_count = upvote_count + 1
    where id = p_feed_id;
  else
    delete from public.community_feed_upvotes
    where feed_id = p_feed_id and user_id = v_user_id;

    update public.community_feed
    set upvote_count = greatest(0, upvote_count - 1)
    where id = p_feed_id;
  end if;

  return query
  select
    coalesce(f.upvote_count, 0)::bigint as new_upvote_count,
    v_inserted as is_upvoted
  from public.community_feed f
  where f.id = p_feed_id;
end;
$$;
