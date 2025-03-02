
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Message } from './types';

export const useMessageHandler = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (messageText: string, sentiment?: string) => {
    if (!messageText.trim()) return;

    // Add user message to chat
    const newMessage: Message = {
      role: 'user',
      content: messageText,
      sentiment,
    };

    setMessages(prev => [...prev, newMessage]);
    setIsProcessing(true);

    // Add loading message
    const loadingMessage: Message = {
      role: 'assistant',
      content: '...',
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      console.log('Sending message to edge function:', messageText);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('process-chat', {
        body: { 
          message: messageText,
          sentiment
        }
      });

      // Handle error cases
      if (error) {
        console.error('Chat processing error:', error);
        throw new Error(`Failed to process message: ${error.message}`);
      }

      // Handle missing data
      if (!data || !data.reply) {
        console.error('Invalid response data:', data);
        throw new Error('No valid response received from the assistant');
      }

      console.log('Received response:', data);

      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.content !== '...'));

      // Add the response message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply 
      }]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.content !== '...'));
      
      // Add error message
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

  return {
    messages,
    isProcessing,
    handleSubmit,
    setMessages
  };
};
