
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

    // Convert audio to base64 and create the request for Gemini's speech recognition
    const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          model: 'default',
          audioChannelCount: 1,
        },
        audio: {
          content: audio
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Speech Recognition error: ${await response.text()}`)
    }

    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No transcription results')
    }

    const text = data.results[0].alternatives[0].transcript

    // Basic sentiment analysis using Gemini
    const sentimentResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') || '',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Analyze the sentiment of this text and respond with ONLY ONE WORD (positive, negative, or neutral): "${text}"`
          }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 1,
        }
      })
    })

    if (!sentimentResponse.ok) {
      throw new Error(`Sentiment Analysis error: ${await sentimentResponse.text()}`)
    }

    const sentimentData = await sentimentResponse.json()
    const sentiment = sentimentData.candidates[0].content.parts[0].text.toLowerCase().trim()

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
