-- Migration: Add lesson-songs relationship
-- This creates a many-to-many relationship between lessons and songs

-- Create lesson_songs junction table
CREATE TABLE lesson_songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure each song can only be added once per lesson
    UNIQUE(lesson_id, song_id)
);

-- Add indexes for better performance
CREATE INDEX idx_lesson_songs_lesson_id ON lesson_songs(lesson_id);
CREATE INDEX idx_lesson_songs_song_id ON lesson_songs(song_id);

-- Enable Row Level Security (RLS)
ALTER TABLE lesson_songs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now
CREATE POLICY "Allow all operations on lesson_songs" ON lesson_songs
    FOR ALL USING (true) WITH CHECK (true);

-- Add helpful view for getting lessons with their songs
CREATE OR REPLACE VIEW lessons_with_songs AS
SELECT 
    l.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', s.id,
                'name', s.name,
                'author', s.author,
                'category', s.category,
                'artwork_url', s.artwork_url
            ) ORDER BY s.name
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
    ) as songs
FROM lessons l
LEFT JOIN lesson_songs ls ON l.id = ls.lesson_id
LEFT JOIN songs s ON ls.song_id = s.id
GROUP BY l.id, l.date, l.remaining_lessons, l.notes, l.created_at, l.updated_at;