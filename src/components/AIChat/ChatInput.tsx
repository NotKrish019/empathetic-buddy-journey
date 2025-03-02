
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Mic, StopCircle } from 'lucide-react';
import { transcribeAudio, processAudioData, useAudioRecorder } from './audioUtils';

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
  const { startRecording, stopRecording, chunksRef } = useAudioRecorder();
  
  const handleStartRecording = async () => {
    const started = await startRecording();
    if (started) {
      setIsRecording(true);
    }
  };

  const handleStopRecording = async () => {
    const chunks = stopRecording();
    setIsRecording(false);
    
    if (chunks.length > 0) {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      const base64Audio = await processAudioData(audioBlob);
      
      // In a real app, this would use the base64Audio for transcription
      // For now, we'll use a mock transcription
      const transcribedText = transcribeAudio();
      const sentiment = "negative"; // Simplified sentiment analysis
      
      await onSubmit(transcribedText, sentiment);
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
          if (e.key === 'Enter' && !isProcessing && input.trim()) {
            onSubmit(input, undefined);
            setInput('');
          }
        }}
        onFocus={onFocus}
        placeholder="Type to chat..."
        className="flex-1 p-2 rounded-lg bg-chat-dark border border-chat-teal/30 text-chat-light placeholder:text-chat-light/50 focus:ring-1 focus:ring-chat-teal focus:outline-none"
        disabled={isProcessing || isRecording}
      />
      
      <Button
        onClick={() => {
          if (input.trim()) {
            onSubmit(input, undefined);
            setInput('');
          }
        }}
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
          ? "bg-red-500 hover:bg-red-600 text-white transition-colors" 
          : "bg-chat-teal hover:bg-chat-teal/80 text-white transition-colors"}
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
