import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side Supabase client with service role key
// This bypasses Row Level Security - use only in server components
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Type definitions for our database schema
export type Video = {
  id: string
  youtube_video_id: string | null
  original_url: string | null
  title: string | null
  description: string | null
  duration: number | null
  created_at: string
}

export type Generation = {
  id: string
  video_id: string
  tone: string | null
  platforms: string[] | null
  cache_key: string | null
  created_at: string
}

export type Output = {
  id: string
  generation_id: string
  platform: string
  format: string
  content: any
  metadata: any | null
  created_at: string
}
