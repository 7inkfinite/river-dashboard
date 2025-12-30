# River Dashboard - Project Context

## Overview
River is an AI system that transforms YouTube videos into platform-specific social content. The platform supports Twitter threads, LinkedIn posts, and Instagram carousels through a workflow emphasizing iterative refinement.

The system accepts YouTube URLs along with tone preferences and target platforms, extracts video transcripts via the YouTube API, checks for cached generations using deterministic keys, and generates content through OpenAI's gpt-4o-mini model. Results are stored in Supabase with full versioning support.

## Architecture

River operates across three primary layers:

### Frontend (This Repo - river-dashboard)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (inline styles in components from Framer)
- **Database Client**: Supabase JS Client
- **Icons**: Lucide React
- **Original Source**: Framer-based React/TSX interface (now migrated to Next.js)

### Orchestration Layer
- **Platform**: Pipedream workflows
- **Function**: Coordinates 14-step processing pipeline
- **Runtime**: Node.js serverless functions

### Backend Services
- **Content Generation**: OpenAI GPT-4o-mini
- **Database & Caching**: Supabase (PostgreSQL)
- **Transcript Extraction**: YouTube API / RapidAPI
- **Landing Page**: Framer (handles marketing and form submission)

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

## Supported Content Formats

### Twitter/X Threads
- **Length**: 8-12 tweets per thread
- **Style**: Natural, conversational formatting
- **Display**: TwitterThreadCard component

### LinkedIn Posts
- **Length**: 120-220 words
- **Tone**: Professional, platform-appropriate
- **Display**: LinkedInPostCard component

### Instagram Carousels
- **Slides**: 4-5 slides per carousel
- **Layout**: Visual hierarchy optimized
- **Aspect Ratios**: 1:1 or 4:5
- **Display**: InstagramCarouselCard component

## Key Technical Decisions

### Caching Strategy
Uses deterministic cache keys incorporating:
- Video ID
- Normalized tone
- Sorted platforms
- Prompt version
This ensures consistency and prevents stale content.

### State Management
The system distinguishes between:
- **Generation**: Initial content creation
- **Tweak**: Iterative refinement
Previous results are preserved during regeneration cycles for calm user feedback.

## Current Implementation Status

### ✅ Completed
1. Dependencies installed (@supabase/supabase-js, lucide-react)
2. Supabase client configured in `/lib/supabase.ts`
3. Folder structure created (`/app/results`, `/components`, `/lib`)
4. Components migrated from Framer project:
   - TwitterThreadCard.tsx
   - LinkedInPostCard.tsx
   - InstagramCarouselCard.tsx
   - RiverResultsRoot.tsx
   - UseRiverGeneration.tsx (custom hook)

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
