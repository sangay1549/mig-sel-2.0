-- Fix post_type for existing official announcements that were
-- incorrectly backfilled as 'grievance' by the previous migration.

update public.community_feed
  set post_type = 'announcement'
  where is_official = true and post_type != 'announcement';
