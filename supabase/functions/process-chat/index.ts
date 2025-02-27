
// Follow this pattern for a simple, reliable Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // For now, let's use a simple deterministic response to ensure reliability
    // Later, we can integrate the Gemini API once basic functionality is working
    let reply = "";
    
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      reply = "Hello! How are you feeling today? I'm here to support your mental wellness journey.";
    } 
    else if (message.toLowerCase().includes("stress") || message.toLowerCase().includes("anxious") || message.toLowerCase().includes("anxiety")) {
      reply = "I understand that feeling stressed can be overwhelming. Consider taking a few deep breaths - breathe in for 4 counts, hold for 4, and exhale for 6. This simple technique can help reduce anxiety in the moment.";
    }
    else if (message.toLowerCase().includes("sad") || message.toLowerCase().includes("depress") || message.toLowerCase().includes("unhappy")) {
      reply = "I'm sorry you're feeling down. Remember that emotions come and go, and it's okay to not feel okay sometimes. Consider engaging in a small activity that usually brings you joy, even if it's just for a few minutes.";
    } 
    else if (message.toLowerCase().includes("sleep") || message.toLowerCase().includes("tired")) {
      reply = "Quality sleep is essential for mental wellbeing. Try establishing a calming bedtime routine, avoid screens an hour before bed, and make your sleeping environment comfortable and cool. These small changes can make a big difference.";
    }
    else if (message.toLowerCase().includes("meditat") || message.toLowerCase().includes("mindful")) {
      reply = "Meditation is a wonderful practice for mental clarity. Start with just 5 minutes of focusing on your breath. When your mind wanders, gently bring your attention back without judgment. Consistency matters more than duration.";
    }
    else {
      reply = "Thank you for sharing. Remember that taking care of your mental health is an ongoing journey, and small steps each day make a difference. Is there a specific aspect of your wellbeing you'd like to focus on today?";
    }
    
    console.log(`Sending reply: "${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}"`);
    
    // Return the response
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
