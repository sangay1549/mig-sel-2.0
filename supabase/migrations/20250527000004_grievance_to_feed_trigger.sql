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

  INSERT INTO public.community_feed (user_name, user_initials, action_text, location, image_url)
  VALUES (v_username, v_initials, NEW.title, v_location, NEW.image_url);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grievance_to_feed ON public.grievances;
CREATE TRIGGER trg_grievance_to_feed
  AFTER INSERT ON public.grievances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_grievance_to_feed();
