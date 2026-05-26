-- Function to sync upvote_count on community_feed
CREATE OR REPLACE FUNCTION sync_feed_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_feed
    SET upvote_count = upvote_count + 1
    WHERE id = NEW.feed_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_feed
    SET upvote_count = GREATEST(0, upvote_count - 1)
    WHERE id = OLD.feed_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS trg_sync_feed_upvote_count ON community_feed_upvotes;
CREATE TRIGGER trg_sync_feed_upvote_count
  AFTER INSERT OR DELETE ON community_feed_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION sync_feed_upvote_count();
