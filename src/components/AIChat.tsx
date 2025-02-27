
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
      toast({
        title: "Recording stopped",
        description: "Processing your message...",
      });
    }
  };

  const processVoiceInput = async (audioData: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-voice-input', {
        body: { audio: audioData }
      });

      if (error) {
        console.error('Voice processing error:', error);
        throw error;
      }

      if (data?.text) {
        await handleSubmit(data.text, data.sentiment);
      } else {
        throw new Error('No text transcribed from voice');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: "Error",
        description: "Could not process voice input. Please try again.",
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
      // Add a mock assistant message immediately to show processing
      const loadingMessage: Message = {
        role: 'assistant',
        content: '...',
      };
      setMessages(prev => [...prev, loadingMessage]);

      console.log('Sending message to edge function:', messageText);
      const { data, error } = await supabase.functions.invoke('process-chat', {
        body: { 
          message: messageText,
          sentiment
        }
      });

      if (error) {
        console.error('Chat processing error:', error);
        throw new Error(`Failed to process message: ${error.message}`);
      }

      if (!data || !data.reply) {
        console.error('Invalid response data:', data);
        throw new Error('No valid response received from the assistant');
      }

      console.log('Received response:', data);

      // Remove the loading message
      setMessages(prev => prev.filter(msg => msg.content !== '...'));

      // Split reply into lines and animate them
      const lines = data.reply.split('\n').filter(Boolean);
      for (let i = 0; i < lines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'assistant' && lastMessage.content !== '...') {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + '\n' + lines[i] }
            ];
          } else {
            return [...prev, { role: 'assistant', content: lines[i] }];
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the loading message
      setMessages(prev => prev.filter(msg => msg.content !== '...'));
      
      // Add an error message from the assistant
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment." 
      }]);
      
      toast({
        title: "Error",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto bg-chat-navy border-chat-teal shadow-lg">
      <CardHeader className="py-3 border-b border-chat-teal/30">
        <CardTitle className="text-center text-chat-gray text-lg">AI Wellness Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3">
        <div className="h-[300px] overflow-y-auto space-y-3 p-3 border border-chat-teal/30 rounded-lg bg-chat-dark/50 shadow-inner">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-chat-light/50 text-sm">
              Start a conversation to get wellness support...
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2.5 rounded-lg transition-all duration-300 ease-in-out animate-fade-in ${
                    message.role === 'user'
                      ? 'bg-chat-teal text-white'
                      : message.content === '...' 
                        ? 'bg-chat-navy/70 border border-chat-teal/30 text-chat-light/50 animate-pulse'
                        : 'bg-chat-navy border border-chat-teal/30 text-chat-light'
                  }`}
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSubmit()}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg bg-chat-dark border border-chat-teal/30 text-chat-light placeholder:text-chat-light/50 focus:ring-1 focus:ring-chat-teal focus:outline-none"
            disabled={isProcessing || isRecording}
          />
          <Button
            onClick={() => handleSubmit()}
            disabled={isProcessing || isRecording || !input.trim()}
            className="bg-chat-teal hover:bg-chat-teal/80 text-white transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
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
      </CardContent>
    </Card>
  );
};
