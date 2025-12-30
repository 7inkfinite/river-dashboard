import { supabase } from '@/lib/supabase'
import { ResultsDisplay } from '@/components/ResultsDisplay'
import { notFound } from 'next/navigation'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const generationId = params.generation_id as string | undefined

  if (!generationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Missing Generation ID
          </h1>
          <p className="text-gray-600">
            Please provide a generation_id parameter in the URL.
          </p>
        </div>
      </div>
    )
  }

  // Fetch generation data
  const { data: generation, error: genError } = await supabase
    .from('generations')
    .select('*')
    .eq('id', generationId)
    .single()

  if (genError || !generation) {
    console.error('Generation fetch error:', genError)
    notFound()
  }

  // Fetch video data
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*')
    .eq('id', generation.video_id)
    .single()

  if (videoError) {
    console.error('Video fetch error:', videoError)
  }

  // Fetch outputs for this generation
  const { data: outputs, error: outputsError } = await supabase
    .from('outputs')
    .select('*')
    .eq('generation_id', generationId)

  if (outputsError) {
    console.error('Outputs fetch error:', outputsError)
  }

  // Format data to match what RiverResultsRoot expects
  const riverResult = {
    video: video || {},
    generation: generation,
    inputs: {
      tone: generation.tone || '',
      platforms: generation.platforms || [],
    },
    outputs: {}, // Will be populated from dbOutputs
    dbOutputs: outputs || [],
    fromCache: false,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResultsDisplay data={riverResult} />
    </div>
  )
}
