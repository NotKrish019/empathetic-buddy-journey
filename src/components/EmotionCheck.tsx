
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smile, Frown, Meh, Heart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const emotions = [
  { name: 'Happy', icon: Smile, color: 'text-chat-light' },
  { name: 'Neutral', icon: Meh, color: 'text-chat-gray' },
  { name: 'Sad', icon: Frown, color: 'text-chat-teal' },
];

export const EmotionCheck = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    toast({
      title: "Emotion logged!",
      description: "Thank you for sharing how you're feeling. Remember, all emotions are valid.",
    });
  };

  return (
    <Card className="p-6 bg-chat-navy border-chat-teal">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="text-chat-light animate-float" />
          <h2 className="text-xl font-semibold text-chat-gray">How are you feeling?</h2>
        </div>
        <div className="flex justify-center gap-4">
          {emotions.map((emotion) => (
            <Button
              key={emotion.name}
              variant={selectedEmotion === emotion.name ? "secondary" : "ghost"}
              className={`p-4 transition-all duration-300 ${
                selectedEmotion === emotion.name 
                  ? 'bg-chat-teal/20 ring-2 ring-chat-teal text-white' 
                  : 'hover:bg-chat-teal/10 text-chat-light'
              }`}
              onClick={() => handleEmotionSelect(emotion.name)}
            >
              <div className="flex flex-col items-center gap-2">
                <emotion.icon className={`w-8 h-8 ${emotion.color}`} />
                <span>{emotion.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
