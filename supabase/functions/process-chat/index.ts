
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get the API key from environment variables
const groqApiKey = Deno.env.get("GROQ_API_KEY");

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

    if (!groqApiKey) {
      console.error("Groq API key not found");
      return new Response(
        JSON.stringify({ error: "API configuration issue" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the context based on sentiment if available
    let systemPrompt = "You are a supportive mental wellness assistant. ";
    if (sentiment) {
      systemPrompt += `The user seems to be feeling ${sentiment}. Tailor your response to be supportive and helpful for someone feeling this way. `;
    }
    systemPrompt += "Keep responses concise (1-3 sentences) and focus on practical mental wellness advice. Be empathetic and warm in tone.";

    // Using Groq API
    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    console.log("Calling Groq API...");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Using Llama 3 8B model, which is fast and efficient
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error response:", errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log("Groq API response received");

    // Extract the response text from the API response
    if (!data.choices || data.choices.length === 0) {
      console.error("No response from Groq API:", data);
      throw new Error("No response received from AI model");
    }

    const reply = data.choices[0].message.content;
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
