'use client'

import * as React from 'react'
import { TwitterThreadCard } from './TwitterThreadCard'
import { LinkedInPostCard } from './LinkedInPostCard'
import { InstagramCarouselCard } from './InstagramCarouselCard'
import type { RegenMode } from './TwitterThreadCard'

type RawRiverResult = any

type NormalizedRiverResult = {
  fromCache: boolean
  videoId: string | null
  youtubeId: string | null
  originalUrl: string | null
  videoTitle: string
  generationId: string | null
  tone: string
  platforms: string[]
  twitterThread?: { tweets: string[]; raw: string }
  linkedInPost?: { post: string; raw: string }
  instagramCarousel?: { slides: string[]; raw: string }
  receivedAt: Date
  raw: RawRiverResult
}

function splitSlidesFromContent(content: string): string[] {
  const text = String(content || '').trim()
  if (!text) return []

  // Prefer explicit separators if present
  if (text.includes('\n\n---\n\n')) {
    return text
      .split('\n\n---\n\n')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  // Otherwise try chunking on double-newlines (best-effort)
  const parts = text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  // If it became too fragmented, fall back to single slide
  if (parts.length > 12) return [text]
  return parts.length ? parts : [text]
}

function normalizeRiverResult(raw: RawRiverResult): NormalizedRiverResult {
  const video = raw?.video || {}
  const generation = raw?.generation || {}
  const inputs = raw?.inputs || {}
  const outputs = raw?.outputs || {}
  const dbOutputs = Array.isArray(raw?.dbOutputs) ? raw.dbOutputs : []

  const videoId: string | null = video.id ?? null
  const youtubeId: string | null = video.youtube_video_id ?? null
  const originalUrl: string | null = video.original_url ?? null

  let videoTitle = 'Untitled video'
  if (video.title) videoTitle = String(video.title)
  else if (youtubeId) videoTitle = `YouTube video (${youtubeId})`
  else if (originalUrl) videoTitle = originalUrl

  const tone: string = inputs.tone ?? ''
  const platforms: string[] = Array.isArray(inputs.platforms)
    ? inputs.platforms
    : []

  // ---------- Twitter ----------
  let twitterThread: { tweets: string[]; raw: string } | undefined
  const twitterOut = outputs.twitter
  if (twitterOut) {
    twitterThread = {
      tweets: Array.isArray(twitterOut.tweets) ? twitterOut.tweets : [],
      raw: String(twitterOut.raw ?? ''),
    }
  } else {
    const fromDb = dbOutputs.find((row: any) => row.platform === 'twitter')
    if (fromDb) {
      const metaTweets = fromDb.metadata?.tweets
      twitterThread = {
        tweets: Array.isArray(metaTweets) ? metaTweets : [],
        raw: String(fromDb.content ?? ''),
      }
    }
  }

  // ---------- LinkedIn post ----------
  let linkedInPost: { post: string; raw: string } | undefined
  const linkedInOut = outputs.linkedin
  if (linkedInOut) {
    linkedInPost = {
      post: String(linkedInOut.post ?? ''),
      raw: String(linkedInOut.post ?? ''),
    }
  } else {
    const fromDb = dbOutputs.find((row: any) => row.platform === 'linkedin')
    if (fromDb) {
      linkedInPost = {
        post: String(fromDb.content ?? ''),
        raw: String(fromDb.content ?? ''),
      }
    }
  }

  // ---------- Instagram carousel ----------
  let instagramCarousel: { slides: string[]; raw: string } | undefined
  const carouselOut = outputs.carousel
  if (carouselOut) {
    const slides = Array.isArray(carouselOut.slides)
      ? carouselOut.slides
      : []
    const rawText = String(carouselOut.raw ?? '')
    instagramCarousel = {
      slides: slides.length ? slides : splitSlidesFromContent(rawText),
      raw: rawText,
    }
  } else {
    const fromDb = dbOutputs.find((row: any) => row.platform === 'carousel')
    if (fromDb) {
      const metaSlides = fromDb.metadata?.slides
      const rawText = String(fromDb.content ?? '')
      instagramCarousel = {
        slides: Array.isArray(metaSlides)
          ? metaSlides
          : splitSlidesFromContent(rawText),
        raw: rawText,
      }
    }
  }

  return {
    fromCache: !!raw?.fromCache,
    videoId,
    youtubeId,
    originalUrl,
    videoTitle,
    generationId: generation.id ?? null,
    tone,
    platforms,
    twitterThread,
    linkedInPost,
    instagramCarousel,
    receivedAt: new Date(),
    raw,
  }
}

export function ResultsDisplay({ data }: { data: RawRiverResult }) {
  const [result, setResult] = React.useState<NormalizedRiverResult | null>(null)

  // Twitter card state
  const [twTweakOpen, setTwTweakOpen] = React.useState(false)
  const [twTweakText, setTwTweakText] = React.useState('')
  const [twCopyLabel, setTwCopyLabel] = React.useState<'copy' | 'copied!'>('copy')
  const twCopyTimerRef = React.useRef<number | null>(null)

  // LinkedIn card state
  const [liTweakOpen, setLiTweakOpen] = React.useState(false)
  const [liTweakText, setLiTweakText] = React.useState('')
  const [liCopyLabel, setLiCopyLabel] = React.useState<'copy' | 'copied!'>('copy')
  const liCopyTimerRef = React.useRef<number | null>(null)

  // Instagram card state
  const [igTweakOpen, setIgTweakOpen] = React.useState(false)
  const [igTweakText, setIgTweakText] = React.useState('')
  const [igCopied, setIgCopied] = React.useState<null | 'slide' | 'all'>(null)
  const [igAspect, setIgAspect] = React.useState<'1:1' | '4:5'>('1:1')
  const igCopyTimerRef = React.useRef<number | null>(null)

  // Normalize data on mount
  React.useEffect(() => {
    if (!data) {
      setResult(null)
      return
    }
    const norm = normalizeRiverResult(data)
    setResult(norm)
  }, [data])

  // Copy handlers
  const handleTwitterCopy = React.useCallback(() => {
    if (!result?.twitterThread) return
    navigator.clipboard.writeText(result.twitterThread.raw)
    setTwCopyLabel('copied!')
    if (twCopyTimerRef.current) window.clearTimeout(twCopyTimerRef.current)
    twCopyTimerRef.current = window.setTimeout(() => setTwCopyLabel('copy'), 2000)
  }, [result])

  const handleLinkedInCopy = React.useCallback(() => {
    if (!result?.linkedInPost) return
    navigator.clipboard.writeText(result.linkedInPost.raw)
    setLiCopyLabel('copied!')
    if (liCopyTimerRef.current) window.clearTimeout(liCopyTimerRef.current)
    liCopyTimerRef.current = window.setTimeout(() => setLiCopyLabel('copy'), 2000)
  }, [result])

  const handleInstagramCopySlide = React.useCallback((index: number) => {
    if (!result?.instagramCarousel) return
    const text = result.instagramCarousel.slides[index]
    if (!text) return
    navigator.clipboard.writeText(text)
    setIgCopied('slide')
    if (igCopyTimerRef.current) window.clearTimeout(igCopyTimerRef.current)
    igCopyTimerRef.current = window.setTimeout(() => setIgCopied(null), 2000)
  }, [result])

  const handleInstagramCopyAll = React.useCallback(() => {
    if (!result?.instagramCarousel) return
    navigator.clipboard.writeText(result.instagramCarousel.raw)
    setIgCopied('all')
    if (igCopyTimerRef.current) window.clearTimeout(igCopyTimerRef.current)
    igCopyTimerRef.current = window.setTimeout(() => setIgCopied(null), 2000)
  }, [result])

  // Regenerate handlers (disabled for read-only view)
  const handleRegenerate = React.useCallback(() => {
    console.log('Regenerate not available in results view')
  }, [])

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading results...</div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF7ED',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '8px',
            }}
          >
            {result.videoTitle}
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Tone: {result.tone || 'Default'} • Platforms:{' '}
            {result.platforms.join(', ') || 'None'}
          </p>
        </div>

        {/* Results Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Twitter Thread */}
          {result.twitterThread && (
            <TwitterThreadCard
              title="Twitter Thread"
              threadText={result.twitterThread.raw}
              onToggleTweak={() => setTwTweakOpen(!twTweakOpen)}
              tweakOpen={twTweakOpen}
              tweakToggleDisabled={true}
              onCopy={handleTwitterCopy}
              copyLabel={twCopyLabel}
              copyDisabled={false}
              tweakText={twTweakText}
              onChangeTweakText={setTwTweakText}
              onRegenerate={handleRegenerate}
              regenMode="idle"
            />
          )}

          {/* LinkedIn Post */}
          {result.linkedInPost && (
            <LinkedInPostCard
              title="LinkedIn Post"
              postText={result.linkedInPost.post}
              onToggleTweak={() => setLiTweakOpen(!liTweakOpen)}
              tweakOpen={liTweakOpen}
              tweakToggleDisabled={true}
              onCopy={handleLinkedInCopy}
              copyLabel={liCopyLabel}
              copyDisabled={false}
              tweakText={liTweakText}
              onChangeTweakText={setLiTweakText}
              onRegenerate={handleRegenerate}
              regenMode="idle"
            />
          )}

          {/* Instagram Carousel */}
          {result.instagramCarousel && (
            <InstagramCarouselCard
              title="Instagram Carousel"
              slides={result.instagramCarousel.slides}
              aspect={igAspect}
              onToggleAspect={() => setIgAspect(igAspect === '1:1' ? '4:5' : '1:1')}
              onToggleTweak={() => setIgTweakOpen(!igTweakOpen)}
              tweakOpen={igTweakOpen}
              tweakDisabled={true}
              tweakText={igTweakText}
              onChangeTweakText={setIgTweakText}
              onRegenerate={handleRegenerate}
              regenMode="idle"
              copied={igCopied}
              onCopySlide={handleInstagramCopySlide}
              onCopyAll={handleInstagramCopyAll}
            />
          )}
        </div>
      </div>
    </div>
  )
}
