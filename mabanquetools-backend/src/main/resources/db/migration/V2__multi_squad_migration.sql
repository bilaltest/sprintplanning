-- Create the new collection table for squads
CREATE TABLE user_squads (
    user_id VARCHAR(25) NOT NULL,
    squad VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES app_user(id)
);

-- Migrate existing data: Copy 'squad' from app_user to user_squads
INSERT INTO user_squads (user_id, squad)
SELECT id, squad
FROM app_user
WHERE squad IS NOT NULL AND squad != '';

-- Drop the old 'squad' column from app_user
ALTER TABLE app_user DROP COLUMN squad;
