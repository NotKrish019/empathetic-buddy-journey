
import { useRef, useState, useEffect } from 'react';

// Define the interface for using the Web Speech API
interface WebSpeechAPI extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

const windowWithSpeech = window as unknown as WebSpeechAPI;

// Initialize the SpeechRecognition API with browser compatibility
const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

/**
 * Custom hook for handling audio recording and speech recognition
 */
export const useAudioRecorder = () => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Initialize speech recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    // Set up event handlers
    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript(prev => prev + ' ' + final);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      // Only set isListening to false if it wasn't stopped programmatically
      if (isListening) {
        setIsListening(false);
      }
    };

    return () => {
      // Clean up
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async (): Promise<boolean> => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      setError(null);
      setInterimTranscript('');
      setFinalTranscript('');
      chunksRef.current = [];
      
      // Start speech recognition
      recognitionRef.current.start();
      setIsListening(true);
      return true;
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition');
      setIsListening(false);
      return false;
    }
  };

  const stopRecording = (): Blob[] => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    return chunksRef.current;
  };

  return {
    isListening,
    startRecording,
    stopRecording,
    interimTranscript,
    finalTranscript,
    error,
    chunksRef,
  };
};

/**
 * Process audio data into base64 format for sending to APIs
 */
export const processAudioData = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Extract base64 data from the data URL
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error('Failed to convert audio to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
};

/**
 * Simple sentiment analysis for demonstration purposes
 * In a real app, this would call a more sophisticated API
 */
export const analyzeSentiment = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  // Very simple keyword-based sentiment analysis
  const negativeWords = ['sad', 'angry', 'upset', 'frustrated', 'depressed', 'anxious', 'worried', 'tired', 'exhausted', 'hopeless'];
  const positiveWords = ['happy', 'excited', 'good', 'great', 'wonderful', 'pleased', 'joy', 'delighted', 'calm', 'relaxed'];
  
  let negativeCount = 0;
  let positiveCount = 0;
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  if (negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  return 'neutral';
};

/**
 * Mock transcription function for testing before implementing real transcription
 * In a production app, this would use the finalTranscript from the speech recognition API
 */
export const transcribeAudio = (): string => {
  return "I'm feeling a bit stressed today, but trying to stay positive.";
};
