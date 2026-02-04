import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecognitionRequest {
  imageUrl: string
  logId: string
}

// Enhanced face recognition simulation with improved accuracy modeling
// In production, this would call your Python ML backend with actual CNN model
async function simulateRecognition(imageUrl: string): Promise<{
  success: boolean
  subjectId: string | null
  subjectName: string | null
  confidence: number
  ssimScore: number
  processingTimeMs: number
  status: 'success' | 'warning' | 'failed'
  featureVector?: number[]
  matchDetails?: {
    topMatches: Array<{ id: string; score: number }>
    threshold: number
    marginAboveThreshold: number
  }
}> {
  const startTime = Date.now()
  
  // Simulate realistic ML processing delay (150-400ms for CNN inference)
  const baseProcessingTime = 150 + Math.random() * 250
  await new Promise(resolve => setTimeout(resolve, baseProcessingTime))
  
  // Enhanced recognition with more realistic probability distribution
  // Using beta distribution simulation for more realistic confidence scores
  const u1 = Math.random()
  const u2 = Math.random()
  const beta = Math.pow(u1, 0.7) * Math.pow(u2, 0.3) // Skewed towards higher values
  
  // Subject database with more realistic entries
  const subjects = [
    { id: 'LFW-0042', name: 'Subject 042', baseConfidence: 0.92 },
    { id: 'LFW-0128', name: 'Subject 128', baseConfidence: 0.89 },
    { id: 'LFW-0234', name: 'Subject 234', baseConfidence: 0.94 },
    { id: 'LFW-0567', name: 'Subject 567', baseConfidence: 0.91 },
    { id: 'LFW-0891', name: 'Subject 891', baseConfidence: 0.87 },
    { id: 'AR-0023', name: 'Subject AR-023', baseConfidence: 0.93 },
    { id: 'AR-0067', name: 'Subject AR-067', baseConfidence: 0.88 },
    { id: 'CASIA-2847', name: 'Subject CASIA-2847', baseConfidence: 0.90 },
  ]
  
  // Recognition threshold (industry standard ~0.75 for masked faces)
  const recognitionThreshold = 0.75
  
  // Calculate final confidence with noise
  const selectedSubject = subjects[Math.floor(Math.random() * subjects.length)]
  const noise = (Math.random() - 0.5) * 0.15
  const rawConfidence = selectedSubject.baseConfidence + noise
  const finalConfidence = Math.max(0, Math.min(1, rawConfidence)) * 100
  
  // SSIM calculation with correlation to confidence
  const ssimBase = 0.75 + (finalConfidence / 100) * 0.2
  const ssimNoise = (Math.random() - 0.5) * 0.08
  const ssimScore = Math.max(0.5, Math.min(0.99, ssimBase + ssimNoise))
  
  // Generate top matches for detailed analysis
  const topMatches = subjects
    .map(s => ({
      id: s.id,
      score: s.id === selectedSubject.id ? finalConfidence : Math.random() * 60 + 20
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
  
  const processingTimeMs = Date.now() - startTime
  
  // Determine status based on confidence thresholds
  if (finalConfidence < recognitionThreshold * 100 * 0.6) {
    // Failed recognition (confidence below 45%)
    return {
      success: false,
      subjectId: null,
      subjectName: null,
      confidence: 0,
      ssimScore: 0,
      processingTimeMs,
      status: 'failed',
      matchDetails: {
        topMatches: [],
        threshold: recognitionThreshold,
        marginAboveThreshold: 0
      }
    }
  } else if (finalConfidence < recognitionThreshold * 100) {
    // Low confidence match (45-75%)
    return {
      success: true,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      confidence: finalConfidence,
      ssimScore,
      processingTimeMs,
      status: 'warning',
      matchDetails: {
        topMatches,
        threshold: recognitionThreshold,
        marginAboveThreshold: (finalConfidence / 100) - recognitionThreshold
      }
    }
  } else {
    // High confidence match (75%+)
    return {
      success: true,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      confidence: finalConfidence,
      ssimScore,
      processingTimeMs,
      status: 'success',
      matchDetails: {
        topMatches,
        threshold: recognitionThreshold,
        marginAboveThreshold: (finalConfidence / 100) - recognitionThreshold
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Validate user
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      console.log('Invalid token:', claimsError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub

    // Parse request body
    const body: RecognitionRequest = await req.json()
    console.log('Processing recognition request:', { imageUrl: body.imageUrl, logId: body.logId })

    if (!body.imageUrl || !body.logId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageUrl and logId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update log to processing status
    const { error: updateError } = await supabase
      .from('recognition_logs')
      .update({ status: 'processing' })
      .eq('id', body.logId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating log to processing:', updateError)
    }

    // Perform recognition
    const result = await simulateRecognition(body.imageUrl)
    console.log('Recognition result:', result)

    // Update log with results
    const { error: finalUpdateError } = await supabase
      .from('recognition_logs')
      .update({
        status: result.status,
        subject_id: result.subjectId,
        subject_name: result.subjectName,
        confidence: result.confidence,
        ssim_score: result.ssimScore,
        processing_time_ms: result.processingTimeMs,
        error_message: result.success ? null : 'Recognition failed - no matching face found'
      })
      .eq('id', body.logId)
      .eq('user_id', userId)

    if (finalUpdateError) {
      console.error('Error updating log with results:', finalUpdateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update recognition log' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          logId: body.logId,
          status: result.status,
          subjectId: result.subjectId,
          subjectName: result.subjectName,
          confidence: result.confidence,
          ssimScore: result.ssimScore,
          processingTimeMs: result.processingTimeMs
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing recognition:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})