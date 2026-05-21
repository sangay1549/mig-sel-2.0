-- Add bonus_awarded column to grievances for tracking awarded status bonuses
-- bit 0 (1): in-progress bonus (+1) has been awarded once (permanent)
-- bit 1 (2): resolved bonus (+2) is currently active (toggles with status)
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS bonus_awarded INTEGER NOT NULL DEFAULT 0;
