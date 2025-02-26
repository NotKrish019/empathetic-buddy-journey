
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { audio } = await req.json()

    if (!audio) {
      throw new Error('No audio data provided')
    }

    // Convert base64 to blob
    const audioBlob = await fetch(`data:audio/webm;base64,${audio}`).then(r => r.blob())
    
    // Create form data for OpenAI
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')

    // Get transcription from OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    })

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${await openAIResponse.text()}`)
    }

    const { text } = await openAIResponse.json()

    // Basic sentiment analysis
    let sentiment = 'neutral'
    const lowerText = text.toLowerCase()
    if (lowerText.match(/\b(happy|joy|excited|great|wonderful|love|amazing)\b/)) {
      sentiment = 'positive'
    } else if (lowerText.match(/\b(sad|angry|upset|terrible|hate|awful|worried|anxious)\b/)) {
      sentiment = 'negative'
    }

    return new Response(
      JSON.stringify({ text, sentiment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
