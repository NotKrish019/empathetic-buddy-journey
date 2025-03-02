import React from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useAudioRecorder = () => {
  const { toast } = useToast();
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.start();
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Recording stopped",
        description: "Processing your message...",
      });
      
      return chunksRef.current;
    }
    return [];
  };

  return {
    startRecording,
    stopRecording,
    mediaRecorderRef,
    chunksRef
  };
};

export const processAudioData = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result?.toString().split(',')[1] || '';
      resolve(base64Audio);
    };
  });
};

// This is a mock transcription since we're not actually using a real STT API
export const transcribeAudio = () => {
  // For now, just return a fixed transcription for demonstration
  return "I'm feeling a bit stressed today.";
};
