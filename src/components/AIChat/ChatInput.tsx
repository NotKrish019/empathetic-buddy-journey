
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Mic, StopCircle } from 'lucide-react';
import { analyzeSentiment, useAudioRecorder } from './audioUtils';
import { useToast } from '@/components/ui/use-toast';

interface ChatInputProps {
  isProcessing: boolean;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  onSubmit: (text: string, sentiment?: string) => Promise<void>;
  inputRef: React.RefObject<HTMLInputElement>;
  onFocus?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  isProcessing, 
  isRecording, 
  setIsRecording, 
  onSubmit, 
  inputRef, 
  onFocus 
}) => {
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const { 
    isListening, 
    startRecording, 
    stopRecording, 
    interimTranscript, 
    finalTranscript, 
    error 
  } = useAudioRecorder();

  // Update UI when recording status changes
  useEffect(() => {
    setIsRecording(isListening);
  }, [isListening, setIsRecording]);

  // Show error toast if speech recognition fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Speech Recognition Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Update input field with transcript
  useEffect(() => {
    if (interimTranscript) {
      setInput(interimTranscript);
    }
  }, [interimTranscript]);

  // Submit final transcript when available
  useEffect(() => {
    if (finalTranscript && isListening === false) {
      const trimmedTranscript = finalTranscript.trim();
      if (trimmedTranscript) {
        const sentiment = analyzeSentiment(trimmedTranscript);
        handleSubmitVoice(trimmedTranscript, sentiment);
      }
    }
  }, [finalTranscript, isListening]);

  const handleStartRecording = async () => {
    const started = await startRecording();
    if (started) {
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    }
  };

  const handleStopRecording = async () => {
    stopRecording();
    toast({
      title: "Recording stopped",
      description: "Processing your message...",
    });
  };

  const handleSubmitVoice = async (text: string, sentiment?: string) => {
    if (text.trim()) {
      await onSubmit(text.trim(), sentiment);
      setInput('');
    }
  };

  const handleSubmitText = async () => {
    if (input.trim()) {
      const sentiment = analyzeSentiment(input);
      await onSubmit(input.trim(), sentiment);
      setInput('');
    }
  };

  return (
    <div className="p-2 flex gap-2 items-center">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !isProcessing && !isRecording && input.trim()) {
            handleSubmitText();
          }
        }}
        onFocus={onFocus}
        placeholder={isRecording ? "Listening..." : "Type to chat..."}
        className={`flex-1 p-2 rounded-lg bg-chat-dark border transition-all duration-300 ${
          isRecording 
            ? "border-red-500 text-chat-light placeholder:text-red-300" 
            : "border-chat-teal/30 text-chat-light placeholder:text-chat-light/50"
        } focus:ring-1 focus:ring-chat-teal focus:outline-none`}
        disabled={isProcessing || isRecording}
      />
      
      <Button
        onClick={handleSubmitText}
        disabled={isProcessing || isRecording || !input.trim()}
        className="bg-chat-teal hover:bg-chat-teal/80 text-white transition-colors"
      >
        <Send className="h-4 w-4" />
      </Button>
      
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={isProcessing}
        variant={isRecording ? "destructive" : "default"}
        className={isRecording 
          ? "bg-red-500 hover:bg-red-600 text-white transition-colors animate-pulse" 
          : "bg-chat-teal hover:bg-chat-teal/80 text-white transition-colors"}
        aria-label={isRecording ? "Stop recording" : "Start voice input"}
      >
        {isRecording ? (
          <StopCircle className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
