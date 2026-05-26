-- Fix all SECURITY DEFINER functions that use SET search_path = ''
-- but referenced tables without schema qualification ("relation does not exist" errors).

-- 1. Fix adjust_points: profiles and grievances MUST be schema-qualified
CREATE OR REPLACE FUNCTION adjust_points(
  p_reporter_id UUID,
  p_grievance_id UUID,
  p_delta INTEGER,
  p_new_value INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET points = GREATEST(0, COALESCE(points, 0) + p_delta)
  WHERE id = p_reporter_id;

  UPDATE public.grievances
  SET bonus_awarded = p_new_value
  WHERE id = p_grievance_id;
END;
$$;

-- 2. Re-assert toggle_feed_upvote with properly qualified public references
CREATE OR REPLACE FUNCTION toggle_feed_upvote(p_feed_id BIGINT)
RETURNS TABLE (new_upvote_count INT, is_upvoted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to toggle upvote';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.community_feed_upvotes
    WHERE feed_id = p_feed_id AND user_id = v_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.community_feed_upvotes
    WHERE feed_id = p_feed_id AND user_id = v_user_id;
  ELSE
    INSERT INTO public.community_feed_upvotes (feed_id, user_id)
    VALUES (p_feed_id, v_user_id);
  END IF;

  RETURN QUERY
  SELECT cf.upvote_count, NOT v_exists
  FROM public.community_feed cf
  WHERE cf.id = p_feed_id;
END;
$$;

-- 3. Re-assert sync_feed_upvote_count trigger function
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

-- Refresh PostgREST schema cache so it picks up any changes
NOTIFY pgrst, 'reload schema';
