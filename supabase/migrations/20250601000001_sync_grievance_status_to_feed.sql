-- Add grievance_id FK to community_feed so we can reliably sync status changes
ALTER TABLE public.community_feed
  ADD COLUMN IF NOT EXISTS grievance_id UUID REFERENCES public.grievances(id) ON DELETE SET NULL;

-- Backfill grievance_id for existing feed items by matching on title + user_id
UPDATE public.community_feed f
SET grievance_id = g.id
FROM public.grievances g
WHERE f.action_text = g.title
  AND f.user_id = g.reporter_id
  AND f.grievance_id IS NULL;

-- Update the INSERT trigger function to include grievance_id
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

  INSERT INTO public.community_feed (user_name, user_initials, action_text, location, image_url, user_id, status, grievance_id)
  VALUES (v_username, v_initials, NEW.title, v_location, NEW.image_url, NEW.reporter_id, NEW.status, NEW.id);

  RETURN NEW;
END;
$$;

-- Trigger function to sync status from grievances to community_feed on UPDATE
CREATE OR REPLACE FUNCTION public.sync_grievance_status_to_feed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE public.community_feed
    SET status = NEW.status
    WHERE grievance_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_grievance_status_to_feed ON public.grievances;
CREATE TRIGGER trg_sync_grievance_status_to_feed
  AFTER UPDATE OF status ON public.grievances
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_grievance_status_to_feed();

-- Also sync status when parent_id changes (merge/unlink) since the child's
-- status follows the master's status in the ComplaintMonitor handleStatusChange
-- cascade logic
DROP TRIGGER IF EXISTS trg_sync_grievance_status_to_feed_on_merge ON public.grievances;
CREATE TRIGGER trg_sync_grievance_status_to_feed_on_merge
  AFTER UPDATE OF parent_id ON public.grievances
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_grievance_status_to_feed();

NOTIFY pgrst, 'reload schema';
