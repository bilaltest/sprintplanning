-- Add start_period and end_period columns to absence table
ALTER TABLE absence ADD COLUMN start_period VARCHAR(10) NOT NULL DEFAULT 'MORNING';
ALTER TABLE absence ADD COLUMN end_period VARCHAR(10) NOT NULL DEFAULT 'AFTERNOON';
