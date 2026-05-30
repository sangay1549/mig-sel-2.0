-- Fix RLS on community_feed so announcements can be inserted
-- The community_feed table was likely created via dashboard (no migration),
-- which means RLS is enabled with only a default SELECT policy.

-- Ensure RLS is enabled (no-op if already enabled)
alter table public.community_feed enable row level security;

-- Drop existing auto-generated policies if any (safe, IF EXISTS)
drop policy if exists "Enable read access for all users" on public.community_feed;
drop policy if exists "Enable insert for authenticated users only" on public.community_feed;
drop policy if exists "Enable update for users based on user_id" on public.community_feed;
drop policy if exists "Enable delete for users based on user_id" on public.community_feed;

-- SELECT: anyone authenticated can read all feed entries
create policy "Anyone can view community feed"
  on public.community_feed for select
  to authenticated
  using (true);

-- INSERT: authenticated users can insert feed entries
create policy "Authenticated users can insert feed entries"
  on public.community_feed for insert
  to authenticated
  with check (true);

-- UPDATE: users can update their own feed entries
create policy "Users can update their own feed entries"
  on public.community_feed for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- DELETE: users can delete their own feed entries
create policy "Users can delete their own feed entries"
  on public.community_feed for delete
  to authenticated
  using (user_id = auth.uid());
