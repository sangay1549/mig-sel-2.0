-- SECURITY DEFINER function to award status-change points
-- Bypasses RLS so admins can update any user's profile points.
-- bit 0 (1): in-progress bonus; bit 1 (2): resolved bonus
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
  delta INTEGER;
  new_bits INTEGER DEFAULT 0;
BEGIN
  -- delta: pending→in-progress=1, pending→resolved=3, in-progress→resolved=2, etc.
  delta :=
    CASE p_new_status
      WHEN 'in-progress' THEN 1
      WHEN 'resolved'    THEN 3
      ELSE 0
    END -
    CASE p_old_status
      WHEN 'in-progress' THEN 1
      WHEN 'resolved'    THEN 3
      ELSE 0
    END;

  IF delta = 0 THEN RETURN; END IF;

  IF p_new_status IN ('in-progress', 'resolved') THEN
    new_bits := new_bits | 1;
  END IF;
  IF p_new_status = 'resolved' THEN
    new_bits := new_bits | 2;
  END IF;

  UPDATE profiles SET points = COALESCE(points, 0) + delta WHERE id = p_reporter_id;
  UPDATE grievances SET bonus_awarded = new_bits WHERE id = p_grievance_id;
END;
$$;
