-- Recalculate upvote_count from actual upvote records
-- Fixes incorrect values caused by data inserted before the trigger was in place
UPDATE community_feed cf
SET upvote_count = COALESCE(
  (SELECT COUNT(*) FROM community_feed_upvotes WHERE feed_id = cf.id),
  0
);
