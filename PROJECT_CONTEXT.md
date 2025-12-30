# River Dashboard - Project Context

## Overview
River is a product that converts YouTube videos to social media posts. This Next.js dashboard handles results display, content library, and editing functionality.

## Architecture

### Frontend (This Repo - river-dashboard)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database Client**: Supabase JS Client

### Backend
- **Workflow**: Pipedream (handles video processing)
- **Database**: Supabase
- **Landing Page**: Framer (separate - handles marketing and form submission)

## Database Schema

### Tables

#### `videos`
Stores YouTube video information
- `id` - Primary key
- `youtube_video_id` - YouTube video identifier
- `original_url` - Original YouTube URL
- `title` - Video title
- `description` - Video description
- `duration` - Video duration in seconds
- `created_at` - Timestamp

#### `generations`
Stores generation requests/jobs
- `id` - Primary key
- `video_id` - Foreign key to videos table
- `tone` - Content tone (e.g., professional, casual)
- `platforms` - Array of target platforms
- `cache_key` - For caching results
- `created_at` - Timestamp

#### `outputs`
Stores generated content for each platform
- `id` - Primary key
- `generation_id` - Foreign key to generations table
- `platform` - Platform name (twitter, linkedin, instagram)
- `format` - Content format (thread, post, carousel)
- `content` - Generated content (JSON)
- `metadata` - Additional metadata (JSON)
- `created_at` - Timestamp

## Current Implementation Status

### ✅ Completed
1. Dependencies installed (@supabase/supabase-js, lucide-react)
2. Supabase client configured in `/lib/supabase.ts`
3. Folder structure created (`/app/results`, `/components`, `/lib`)

### 🚧 In Progress
4. Moving Framer components to `/components`:
   - TwitterThreadCard.tsx
   - LinkedInPostCard.tsx
   - InstagramCarouselCard.tsx
   - RiverResultsRoot.tsx

### 📋 Pending
5. Create `/app/results/page.tsx` with:
   - Accept `generation_id` query parameter
   - Fetch generation and outputs from Supabase
   - Display using RiverResultsRoot component

## Environment Variables

Located in `.env.local` (not committed to git):
```
NEXT_PUBLIC_SUPABASE_URL=https://reocmqlhiopossoezjve.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

## Development Branch
- Branch: `claude/build-river-dashboard-DXree`
- All development happens on this branch
- Regular commits and pushes required

## Key Files

- `/lib/supabase.ts` - Supabase client and TypeScript types
- `/app/results/page.tsx` - Results display page (to be created)
- `/components/*Card.tsx` - Platform-specific content cards (to be added)
- `/components/RiverResultsRoot.tsx` - Main results container (to be added)

## Notes
- Service role key bypasses RLS - use only in Server Components
- Components being migrated from Framer project
- This dashboard focuses on post-generation results display and management
