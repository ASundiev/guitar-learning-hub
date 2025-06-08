# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`

## Architecture Overview

This is a React + TypeScript guitar learning app with Supabase backend that gracefully falls back to local storage when Supabase is not configured.

### Key Components
- **App.tsx**: Main app with tab navigation between lessons and repertoire
- **LessonLog.tsx**: Lesson tracking with remaining lesson counts and notes
- **Repertoire.tsx**: Song management with 4 categories (rehearsing, want-to-learn, studied, recorded)
- **SetupBanner.tsx**: Shows configuration status and setup guidance

### Data Layer
- **supabase.ts**: Database client with dual-mode operation (cloud/local)
- **musicService.ts**: iTunes API integration for album artwork fetching
- Mock data services automatically activate when Supabase is not configured

### UI Framework
Uses custom UI components in `src/components/ui/` built on Radix UI primitives with Tailwind CSS. All components use CSS custom properties for theming (dark mode by default).

## Environment Configuration

Required environment variables for Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The app automatically detects configuration status via `isSupabaseConfigured` check in supabase.ts and falls back to local storage when not configured.

## Database Schema

Two main tables:
- **lessons**: date, remaining_lessons, notes
- **songs**: name, author, tabs_link, video_link, comments, recording_link, artwork_url, category

See `database/schema.sql` for complete schema definitions.

## Deployment

The app is configured for Vercel deployment with automatic environment variable detection. See `DEPLOYMENT.md` for detailed instructions.