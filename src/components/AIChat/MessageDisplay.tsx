
import React, { useEffect, useRef } from 'react';
import { Message } from './types';
import { HeartPulse, ThumbsDown, ThumbsUp } from 'lucide-react';

interface MessageDisplayProps {
  messages: Message[];
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSentimentIcon = (sentiment?: string) => {
    if (!sentiment) return null;
    
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-3 w-3 text-green-400" />;
      case 'negative':
        return <ThumbsDown className="h-3 w-3 text-red-400" />;
      case 'neutral':
        return <HeartPulse className="h-3 w-3 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
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
              {message.role === 'user' && message.sentiment && (
                <div className="flex items-center mt-1 opacity-70 text-xs">
                  {getSentimentIcon(message.sentiment)}
                  <span className="ml-1 capitalize">{message.sentiment}</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
