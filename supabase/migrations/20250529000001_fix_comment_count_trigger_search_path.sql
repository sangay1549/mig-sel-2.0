-- Fix update_feed_comment_count() to use SET search_path = '' and schema-qualified table references
-- This prevents "relation does not exist" errors when the trigger fires within a context
-- that has an empty search_path (e.g., from toggle_feed_upvote RPC).
CREATE OR REPLACE FUNCTION update_feed_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_feed SET comment_count = comment_count + 1 WHERE id = NEW.feed_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_feed SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.feed_id;
    RETURN OLD;
  END IF;
END;
$$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
