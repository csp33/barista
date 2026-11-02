-- 0004: Add actual_temperature column to extraction_feedbacks
ALTER TABLE extraction_feedbacks ADD COLUMN IF NOT EXISTS actual_temperature VARCHAR(32);
