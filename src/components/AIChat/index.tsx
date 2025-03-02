
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageDisplay } from './MessageDisplay';
import { ChatInput } from './ChatInput';
import { useMessageHandler } from './useMessageHandler';
import { Message } from './types';

export const AIChat = () => {
  const { messages, isProcessing, handleSubmit } = useMessageHandler();
  const [isRecording, setIsRecording] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleChat = () => {
    setIsChatExpanded(!isChatExpanded);
    // Focus the input field when chat is expanded
    if (!isChatExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto relative z-10">
      <AnimatePresence>
        {isChatExpanded ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-2"
          >
            <Card className="bg-chat-navy border-chat-teal shadow-lg overflow-hidden">
              <CardContent className="space-y-3 p-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-chat-gray text-sm">AI Wellness Assistant</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleChat}
                    className="h-6 w-6 text-chat-gray hover:text-white hover:bg-chat-teal/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <MessageDisplay messages={messages} />
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Always visible chat input bar */}
      <motion.div 
        className="w-full"
        initial={false}
        animate={{ 
          backgroundColor: isChatExpanded ? 'rgba(4, 38, 48, 1)' : 'rgba(4, 38, 48, 0.9)',
          borderRadius: isChatExpanded ? '0 0 0.75rem 0.75rem' : '0.75rem',
          borderWidth: 1,
          borderColor: 'rgba(76, 114, 115, 0.3)',
        }}
        transition={{ duration: 0.2 }}
      >
        {!isChatExpanded && (
          <div className="p-2 flex gap-2 items-center">
            <Button
              onClick={toggleChat}
              variant="ghost"
              size="icon"
              className="text-chat-gray hover:text-white hover:bg-chat-teal/20"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            
            <input
              ref={inputRef}
              type="text"
              placeholder="Type to chat..."
              className="flex-1 p-2 rounded-lg bg-chat-dark border border-chat-teal/30 text-chat-light placeholder:text-chat-light/50 focus:ring-1 focus:ring-chat-teal focus:outline-none"
              onFocus={() => setIsChatExpanded(true)}
            />
          </div>
        )}
        
        {isChatExpanded && (
          <ChatInput 
            isProcessing={isProcessing}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            onSubmit={handleSubmit}
            inputRef={inputRef}
            onFocus={() => {
              if (!isChatExpanded) {
                setIsChatExpanded(true);
              }
            }}
          />
        )}
      </motion.div>
    </div>
  );
};
