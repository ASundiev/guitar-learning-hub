-- Migration: Add artwork_url column to songs table
-- Run this in your Supabase SQL Editor to enable album artwork storage

-- Add artwork_url column if it doesn't exist
ALTER TABLE songs ADD COLUMN IF NOT EXISTS artwork_url TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'songs' 
ORDER BY ordinal_position;