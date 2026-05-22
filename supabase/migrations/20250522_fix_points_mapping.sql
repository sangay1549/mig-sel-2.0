-- Migrate existing bonus_awarded values from bitmask to direct point values
-- Old bitmask: 0 (pending), 1 (in-progress), 3 (resolved)
-- New:          1 (pending), 2 (in-progress), 4 (resolved)
UPDATE public.grievances
SET bonus_awarded = CASE
  WHEN bonus_awarded = 0 THEN 1
  WHEN bonus_awarded = 1 THEN 2
  WHEN bonus_awarded = 3 THEN 4
  ELSE 1
END;

-- Replace the function with direct point mapping
-- pending=1, in-progress=2, resolved=4
-- Delta = new_value - old_value (handles both forward and backward transitions)
CREATE OR REPLACE FUNCTION award_points_for_status_fn(
  p_reporter_id UUID,
  p_grievance_id UUID,
  p_old_status TEXT,
  p_new_status TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  old_value INTEGER;
  new_value INTEGER;
  delta INTEGER;
BEGIN
  old_value := CASE p_old_status
    WHEN 'pending' THEN 1
    WHEN 'in-progress' THEN 2
    WHEN 'resolved' THEN 4
    ELSE 0
  END;

  new_value := CASE p_new_status
    WHEN 'pending' THEN 1
    WHEN 'in-progress' THEN 2
    WHEN 'resolved' THEN 4
    ELSE 0
  END;

  delta := new_value - old_value;

  IF delta = 0 THEN RETURN; END IF;

  UPDATE public.profiles SET points = COALESCE(points, 0) + delta WHERE id = p_reporter_id;
  UPDATE public.grievances SET bonus_awarded = new_value WHERE id = p_grievance_id;
END;
$$;
