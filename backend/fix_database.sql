-- Add missing columns to gamestore_game table
ALTER TABLE gamestore_game ADD COLUMN IF NOT EXISTS slug VARCHAR(250);
ALTER TABLE gamestore_game ADD COLUMN IF NOT EXISTS genre VARCHAR(100);
ALTER TABLE gamestore_game ADD COLUMN IF NOT EXISTS meta_title VARCHAR(200);
ALTER TABLE gamestore_game ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160);
ALTER TABLE gamestore_game ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(255);
ALTER TABLE gamestore_game ADD COLUMN IF NOT EXISTS positive_reviews INTEGER DEFAULT 0;

-- Create unique index on slug (but don't fail if it exists)
CREATE UNIQUE INDEX IF NOT EXISTS gamestore_game_slug_key ON gamestore_game(slug);
