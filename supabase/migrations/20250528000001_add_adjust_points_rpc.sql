-- Add bonus_awarded column to grievances if not present
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS bonus_awarded smallint NOT NULL DEFAULT 0;

-- Create the adjust_points RPC function that the client code calls
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
  -- Update the reporter's total points
  UPDATE profiles
  SET points = GREATEST(0, COALESCE(points, 0) + p_delta)
  WHERE id = p_reporter_id;

  -- Update the grievance's bonus_awarded
  UPDATE grievances
  SET bonus_awarded = p_new_value
  WHERE id = p_grievance_id;
END;
$$;
