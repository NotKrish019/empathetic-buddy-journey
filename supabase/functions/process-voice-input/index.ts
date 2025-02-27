
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Received audio data of length:', audio.length);

    // For this implementation, we'll use a simplified approach
    // that returns a mock transcription since the actual Google Speech API
    // may require additional setup and billing
    
    // Simple sentiment analysis function
    const basicSentimentAnalysis = (text: string): string => {
      const lowerText = text.toLowerCase();
      
      const positiveWords = ['happy', 'joy', 'grateful', 'excited', 'good', 'calm', 'peaceful', 'great'];
      const negativeWords = ['sad', 'angry', 'upset', 'anxious', 'stressed', 'worried', 'frustrated', 'bad'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveCount++;
      });
      
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeCount++;
      });
      
      if (positiveCount > negativeCount) return 'positive';
      if (negativeCount > positiveCount) return 'negative';
      return 'neutral';
    };

    // For demo purposes, generate a simple response
    // In production, you would connect to Speech-to-Text API
    const mockText = "I'm feeling a bit stressed today but trying to stay positive.";
    const sentiment = basicSentimentAnalysis(mockText);

    console.log('Transcribed text:', mockText);
    console.log('Detected sentiment:', sentiment);

    return new Response(
      JSON.stringify({ text: mockText, sentiment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-voice-input function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
