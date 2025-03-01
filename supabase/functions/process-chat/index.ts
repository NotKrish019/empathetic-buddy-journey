
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get the API key from environment variables
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { message, sentiment } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    console.log(`Sentiment: ${sentiment || 'not provided'}`);

    if (!geminiApiKey) {
      console.error("Gemini API key not found");
      return new Response(
        JSON.stringify({ error: "API configuration issue" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the context based on sentiment if available
    let contextPrompt = "You are a supportive mental wellness assistant. ";
    if (sentiment) {
      contextPrompt += `The user seems to be feeling ${sentiment}. Tailor your response to be supportive and helpful for someone feeling this way. `;
    }
    contextPrompt += "Keep responses concise (1-3 sentences) and focus on practical mental wellness advice. Be empathetic and warm in tone.";

    // Using the correct endpoint for the free version of Gemini API
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    console.log("Calling Gemini API at:", apiUrl);
    
    const response = await fetch(`${apiUrl}?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: contextPrompt },
              { text: `User message: ${message}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
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
      const errorData = await response.text();
      console.error("Gemini API error response:", errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data).substring(0, 200) + "...");

    // Extract the response text from the API response format
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No response from Gemini API:", data);
      throw new Error("No response received from AI model");
    }

    const reply = data.candidates[0].content.parts[0].text;
    console.log(`Sending reply: "${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}"`);

    // Return the AI response
    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(
      JSON.stringify({ error: `Failed to process message: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
