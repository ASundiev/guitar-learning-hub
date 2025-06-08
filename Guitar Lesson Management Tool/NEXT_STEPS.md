# 🎸 Final Setup Steps for Your Guitar Learning Hub

Great! Your Supabase credentials are now configured. You just need to create the database tables to complete the setup.

## Your Project Details
- **Project Name**: guitar-lesson-management
- **Project ID**: hhvbejmurxkdejmvxdgw
- **URL**: https://hhvbejmurxkdejmvxdgw.supabase.co ✅
- **API Key**: Configured ✅

## Next Steps

### 1. Create Database Tables (New Setup)

If you haven't set up your database yet:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/hhvbejmurxkdejmvxdgw
2. Click on **SQL Editor** in the left sidebar
3. Copy the SQL code below and paste it into the editor
4. Click **Run** to create the tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create lessons table
CREATE TABLE lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    remaining_lessons INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create songs table
CREATE TABLE songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    tabs_link TEXT,
    video_link TEXT,
    comments TEXT NOT NULL,
    recording_link TEXT,
    artwork_url TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('rehearsing', 'want-to-learn', 'studied', 'recorded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_lessons_date ON lessons(date DESC);
CREATE INDEX idx_songs_category ON songs(category);
CREATE INDEX idx_songs_created_at ON songs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now
CREATE POLICY "Allow all operations on lessons" ON lessons
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on songs" ON songs
    FOR ALL USING (true) WITH CHECK (true);
```

### 2. Update Existing Database (If Already Set Up)

If you've already created the database and want to add the album artwork feature, run these migrations:

**Step 1: Add the "studied" category (if not already done):**
```sql
-- Update the CHECK constraint to include 'studied' category
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_category_check;
ALTER TABLE songs ADD CONSTRAINT songs_category_check 
    CHECK (category IN ('rehearsing', 'want-to-learn', 'studied', 'recorded'));
```

**Step 2: Add album artwork support:**
```sql
-- Add artwork_url column for album covers
ALTER TABLE songs ADD COLUMN IF NOT EXISTS artwork_url TEXT;
```

### 3. Quick Migration (Copy & Paste)

If you already have data and just need the latest features, copy and run this:

```sql
-- Complete migration for existing databases
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_category_check;
ALTER TABLE songs ADD CONSTRAINT songs_category_check 
    CHECK (category IN ('rehearsing', 'want-to-learn', 'studied', 'recorded'));
ALTER TABLE songs ADD COLUMN IF NOT EXISTS artwork_url TEXT;
```

### 4. Test the Connection

After running the SQL:
1. Refresh your app
2. The orange setup banner should disappear
3. If you see a blue "Album Artwork Available" banner, run the migration above
4. Try adding a lesson or song to test the connection
5. Check your Supabase dashboard under **Database > Tables** to see the data

### 5. Verify Everything Works

You should now be able to:
- ✅ Add, edit, and delete lessons
- ✅ Add, edit, and delete songs
- ✅ **Automatic album artwork** - Songs now display beautiful cover art from iTunes
- ✅ Move songs between categories (rehearsing, want to learn, studied, recorded)
- ✅ Data persists after page refresh
- ✅ Both you and your teacher can access and edit the same data

## New Features

### 🎨 Album Artwork
Your repertoire now automatically fetches and displays album artwork for your songs:

- **Automatic fetching** - When you add a song, the app searches iTunes for matching artwork
- **High-quality images** - 600x600 pixel album covers for crisp display
- **Persistent storage** - Artwork URLs are stored in the database to avoid repeated API calls
- **Fallback** - Clean music icon displayed when artwork isn't found
- **No API key required** - Uses free iTunes Search API
- **Graceful degradation** - Works even if the database migration isn't run yet

### 📚 Song Categories

Your repertoire supports four categories:

1. **🎵 Currently Rehearsing** - Songs you're actively practicing
2. **❤️ Want to Learn** - Songs on your wishlist to tackle next
3. **📖 Studied** - Songs you've learned and understand well
4. **⭐ Recorded** - Songs you've mastered and recorded

## Troubleshooting

### Common Issues:

1. **Setup banner still shows**: Make sure you ran the SQL successfully
2. **"Failed to fetch" errors**: Check your internet connection and Supabase project status
3. **Data not appearing**: Verify the tables were created in Database > Tables
4. **Permission errors**: Ensure the RLS policies were created correctly
5. **Category errors**: If you get errors about invalid categories, make sure you ran the updated schema with all four categories
6. **Artwork not loading**: The iTunes API is free but has rate limits - artwork will load automatically over time
7. **"artwork_url column not found"**: Run the migration SQL above to add album artwork support

### Migration Issues:

- **Blue banner appears**: This means artwork is working but not being saved. Run the migration SQL.
- **Existing songs missing artwork**: Artwork will be fetched automatically when you view them
- **Console warnings about artwork_url**: Normal until you run the migration

## You're All Set! 🎉

Your guitar lesson management hub is now fully functional with:
- ✨ **Beautiful album artwork** for visual appeal
- 📊 **Persistent cloud storage** with Supabase
- 🎯 **Four-category organization** system
- 🤝 **Collaborative editing** for you and your teacher
- 📱 **Responsive design** that works on all devices
- 🛡️ **Graceful error handling** for smooth user experience

**Quick Links:**
- [Your Supabase Dashboard](https://supabase.com/dashboard/project/hhvbejmurxkdejmvxdgw)
- [Database Tables](https://supabase.com/dashboard/project/hhvbejmurxkdejmvxdgw/editor)
- [API Logs](https://supabase.com/dashboard/project/hhvbejmurxkdejmvxdgw/logs/explorer)