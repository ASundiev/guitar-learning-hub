# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new account if you don't have one
2. Create a new project
3. Choose a name, database password, and region
4. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the "Project URL" and "anon public" key
3. Update `/lib/supabase.ts` with your credentials by replacing the placeholder values:

**Find these lines in `/lib/supabase.ts`:**
```typescript
const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseAnonKey = 'placeholder-key';
```

**Replace with your actual values:**
```typescript
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your actual anon key
```

## 3. Set Up Database Tables

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `/database/schema.sql`
3. Paste and run the SQL to create the tables

## 4. Verify Installation

The Supabase client should already be available. If you see any import errors, the package might need to be installed:

```bash
npm install @supabase/supabase-js
```

## 5. Test the Connection

After setting up, the app should automatically connect to your Supabase database. You'll know it's working when:

- The orange setup banner disappears
- You can add lessons and songs through the UI
- Data persists after page refresh
- You can view your data in the Supabase dashboard under Database > Tables

## Current Fallback Behavior

Until you set up Supabase, the app will:
- Show an orange setup banner at the top
- Use temporary local storage for data
- Log warnings in the browser console about using mock data
- Continue to function normally (but data will be lost on page refresh)

## Database Schema

### Lessons Table
- `id` (UUID) - Primary key
- `date` (DATE) - Lesson date
- `remaining_lessons` (INTEGER) - Number of lessons remaining
- `notes` (TEXT) - Lesson notes and content
- `created_at` (TIMESTAMP) - When record was created
- `updated_at` (TIMESTAMP) - When record was last updated

### Songs Table
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Song name
- `author` (VARCHAR) - Artist/composer name
- `tabs_link` (TEXT) - Link to guitar tabs
- `video_link` (TEXT) - Link to tutorial video
- `comments` (TEXT) - Notes about the song
- `recording_link` (TEXT) - Optional link to your recording
- `category` (ENUM) - One of: 'rehearsing', 'want-to-learn', 'recorded'
- `created_at` (TIMESTAMP) - When record was created
- `updated_at` (TIMESTAMP) - When record was last updated

## Security

The current setup allows all operations for simplicity. For production use, consider:

1. Setting up proper authentication
2. Implementing more restrictive Row Level Security policies
3. Adding user-specific data isolation

## Troubleshooting

- **"Invalid URL" or "process is not defined" errors**: Make sure you've replaced the placeholder values in `/lib/supabase.ts` with your actual Supabase credentials
- **Data not persisting**: Check that your Supabase project is active and credentials are correct
- **Connection errors**: Verify your project URL and API key in the Supabase dashboard
- **Setup banner won't disappear**: Ensure both the URL and API key are correctly replaced and the URL starts with `https://` and contains `supabase.co`

## Example Configuration

Here's what your configuration should look like after setup:

```typescript
// ✅ Correct configuration
const supabaseUrl = 'https://abcdefghijklmnop.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5...';

// ❌ Incorrect - still using placeholders
const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseAnonKey = 'placeholder-key';
```