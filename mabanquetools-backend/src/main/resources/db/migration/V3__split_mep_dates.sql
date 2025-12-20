-- Add new columns
ALTER TABLE sprint ADD COLUMN release_date_back VARCHAR(10);
ALTER TABLE sprint ADD COLUMN release_date_front VARCHAR(10);

-- Migrate existing data: duplicate release_date to both new columns
UPDATE sprint SET release_date_back = release_date;
UPDATE sprint SET release_date_front = release_date;

-- Make new columns not null
ALTER TABLE sprint ALTER COLUMN release_date_back SET NOT NULL;
ALTER TABLE sprint ALTER COLUMN release_date_front SET NOT NULL;

-- Drop old column
ALTER TABLE sprint DROP COLUMN release_date;
