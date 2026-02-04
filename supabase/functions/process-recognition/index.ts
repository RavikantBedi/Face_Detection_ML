import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecognitionRequest {
  imageUrl: string
  logId: string
}

// Simulated face recognition processing
// In production, this would call your Python ML backend
async function simulateRecognition(imageUrl: string): Promise<{
  success: boolean
  subjectId: string | null
  subjectName: string | null
  confidence: number
  ssimScore: number
  processingTimeMs: number
  status: 'success' | 'warning' | 'failed'
}> {
  const startTime = Date.now()
  
  // Simulate ML processing delay (100-300ms)
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
  
  // Simulate different recognition outcomes
  const random = Math.random()
  
  if (random > 0.85) {
    // Failed recognition (15% chance)
    return {
      success: false,
      subjectId: null,
      subjectName: null,
      confidence: 0,
      ssimScore: 0,
      processingTimeMs: Date.now() - startTime,
      status: 'failed'
    }
  } else if (random > 0.7) {
    // Low confidence match (15% chance)
    const subjects = ['LFW-0891', 'CASIA-2847', 'AR-0067']
    const subjectId = subjects[Math.floor(Math.random() * subjects.length)]
    return {
      success: true,
      subjectId,
      subjectName: `Subject ${subjectId.split('-')[1]}`,
      confidence: 65 + Math.random() * 10,
      ssimScore: 0.65 + Math.random() * 0.1,
      processingTimeMs: Date.now() - startTime,
      status: 'warning'
    }
  } else {
    // High confidence match (70% chance)
    const subjects = ['LFW-0042', 'LFW-0128', 'LFW-0234', 'LFW-0567', 'AR-0023']
    const subjectId = subjects[Math.floor(Math.random() * subjects.length)]
    return {
      success: true,
      subjectId,
      subjectName: `Subject ${subjectId.split('-')[1]}`,
      confidence: 85 + Math.random() * 14,
      ssimScore: 0.82 + Math.random() * 0.15,
      processingTimeMs: Date.now() - startTime,
      status: 'success'
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