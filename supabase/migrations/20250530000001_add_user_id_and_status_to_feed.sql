ALTER TABLE community_feed
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT;

-- Backfill status and user_id for existing feed items from grievances
UPDATE community_feed f
SET
  status = g.status,
  user_id = g.reporter_id
FROM public.grievances g
WHERE f.action_text = g.title
  AND f.user_id IS NULL
  AND g.status IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_grievance_to_feed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username TEXT;
  v_initials TEXT;
  v_location TEXT;
BEGIN
  SELECT username INTO v_username
  FROM public.profiles
  WHERE id = NEW.reporter_id;

  IF v_username IS NULL THEN
    v_username := 'Anonymous';
    v_initials := 'A';
  ELSE
    v_initials := UPPER(LEFT(v_username, 1));
  END IF;

  v_location := NEW.latitude::TEXT || ', ' || NEW.longitude::TEXT;

  INSERT INTO public.community_feed (user_name, user_initials, action_text, location, image_url, user_id, status)
  VALUES (v_username, v_initials, NEW.title, v_location, NEW.image_url, NEW.reporter_id, NEW.status);

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
