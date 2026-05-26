-- RPC to atomically toggle an upvote and return the authoritative count
-- This replaces the client-side upsert/delete + query invalidation pattern,
-- eliminating race conditions from React 19 Strict Mode double-mounting
-- and ensuring the client always gets the ground-truth count from the DB.
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
  -- Ensure the user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to toggle upvote';
  END IF;

  -- Check current state
  SELECT EXISTS(
    SELECT 1 FROM public.community_feed_upvotes
    WHERE feed_id = p_feed_id AND user_id = v_user_id
  ) INTO v_exists;

  -- Toggle (trigger on community_feed_upvotes handles upvote_count sync)
  IF v_exists THEN
    DELETE FROM public.community_feed_upvotes
    WHERE feed_id = p_feed_id AND user_id = v_user_id;
  ELSE
    INSERT INTO public.community_feed_upvotes (feed_id, user_id)
    VALUES (p_feed_id, v_user_id);
  END IF;

  -- Return the authoritative count from the DB (after trigger has fired)
  RETURN QUERY
  SELECT cf.upvote_count, NOT v_exists
  FROM public.community_feed cf
  WHERE cf.id = p_feed_id;
END;
$$;
