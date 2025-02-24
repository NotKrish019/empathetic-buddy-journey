
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { audio } = await req.json()

    // First, convert speech to text using Whisper API (still using OpenAI for this part)
    const formData = new FormData()
    const audioBlob = await fetch(`data:audio/webm;base64,${audio}`).then(r => r.blob())
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    })

    const { text } = await transcriptionResponse.json()

    // Then, analyze sentiment using Gemini
    const sentimentResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: `Analyze the sentiment of the following text and respond with only one word: "positive", "negative", or "neutral". Text to analyze: "${text}"`
          }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 1
        }
      })
    })

    const sentimentData = await sentimentResponse.json()
    const sentiment = sentimentData.candidates[0].content.parts[0].text.toLowerCase().trim()

    return new Response(JSON.stringify({
      text,
      sentiment,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
