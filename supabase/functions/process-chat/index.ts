
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
    const { message, sentiment } = await req.json()

    if (!message) {
      throw new Error('Message is required')
    }

    console.log('Received message:', message);

    // Define a system prompt specific to mental wellness
    const systemPrompt = "You are a compassionate mental wellness assistant. Provide supportive, clear, and concise guidance. Focus on mindfulness, stress reduction, and emotional well-being techniques. Keep responses brief but helpful.";
    
    // Simulate a response for testing - use this if API integration is failing
    // Remove this and uncomment the actual API call below once confirmed working
    /*
    const simulatedResponse = {
      reply: "I understand how you're feeling. Remember to take a few deep breaths and focus on the present moment. You're doing great by reaching out, and that's an important step in self-care."
    };
    return new Response(
      JSON.stringify(simulatedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    */

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    console.log('Using API Key:', apiKey ? 'Available (not shown for security)' : 'Not available');
    
    // Properly format the request for Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser message: ${message}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response structure:', JSON.stringify(data, null, 2));
    
    // Handle various response formats from Gemini API
    let reply = '';
    if (data.candidates && data.candidates.length > 0) {
      if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        reply = data.candidates[0].content.parts[0].text;
      } else if (data.candidates[0].text) {
        reply = data.candidates[0].text;
      }
    }

    if (!reply) {
      console.error('No valid text found in response:', data);
      throw new Error('No valid response content from Gemini');
    }

    console.log('Sending reply:', reply.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
