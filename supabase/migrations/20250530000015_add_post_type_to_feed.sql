-- Add post_type column to community_feed to distinguish
-- grievance reports from life updates and official announcements.

alter table public.community_feed
  add column post_type text;

update public.community_feed
  set post_type = 'grievance'
  where post_type is null;

alter table public.community_feed
  alter column post_type set not null;

alter table public.community_feed
  alter column post_type set default 'grievance';

create index if not exists idx_community_feed_post_type
  on public.community_feed(post_type);
