-- RLS policies for community_feed_upvotes
-- The toggle_feed_upvote function uses security definer and bypasses RLS,
-- but the feed query directly SELECTs from this table to check which items
-- the current user has upvoted. Without a SELECT policy, RLS blocks that query.

alter table public.community_feed_upvotes enable row level security;

drop policy if exists "Anyone can view upvotes" on public.community_feed_upvotes;
create policy "Anyone can view upvotes"
  on public.community_feed_upvotes for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their own upvotes" on public.community_feed_upvotes;
create policy "Users can insert their own upvotes"
  on public.community_feed_upvotes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own upvotes" on public.community_feed_upvotes;
create policy "Users can delete their own upvotes"
  on public.community_feed_upvotes for delete
  to authenticated
  using (auth.uid() = user_id);
