ALTER TABLE waste_records ADD COLUMN IF NOT EXISTS edit_count smallint NOT NULL DEFAULT 0;
