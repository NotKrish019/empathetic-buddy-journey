
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Send, StopCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sentiment?: string;
}

export const AIChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (base64Audio) {
            await processVoiceInput(base64Audio);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioData: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-voice-input', {
        body: { audio: audioData }
      });

      if (error) throw error;

      if (data.text) {
        await handleSubmit(data.text, data.sentiment);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: "Error",
        description: "Could not process voice input",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (text?: string, sentiment?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const newMessage: Message = {
      role: 'user',
      content: messageText,
      sentiment,
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-chat', {
        body: { 
          message: messageText,
          sentiment
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send message",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-chat-navy border-chat-teal">
      <CardHeader>
        <CardTitle className="text-center text-chat-gray">AI Wellness Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[400px] overflow-y-auto space-y-4 p-4 border border-chat-teal/30 rounded-lg bg-chat-dark/50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-chat-teal text-white'
                    : 'bg-chat-navy border border-chat-teal/30 text-chat-light'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type your message..."
              className="w-full p-2 rounded-lg bg-chat-dark border border-chat-teal/30 text-chat-light placeholder:text-chat-light/50"
              disabled={isProcessing || isRecording}
            />
          </div>
          <Button
            onClick={() => handleSubmit()}
            disabled={isProcessing || isRecording || !input.trim()}
            className="bg-chat-teal hover:bg-chat-teal/80 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            variant={isRecording ? "destructive" : "default"}
            className={isRecording 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-chat-teal hover:bg-chat-teal/80 text-white"}
          >
            {isRecording ? (
              <StopCircle className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
