
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Leaf, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { BreathingExercisesModal } from './BreathingExercisesModal';

const strategies = [
  {
    title: 'Deep Breathing',
    description: 'Choose from various breathing exercises for different situations',
    icon: Sun,
    action: 'breathing'
  },
  {
    title: 'Mindful Moment',
    description: 'Notice 5 things you can see, 4 you can touch, 3 you can hear',
    icon: Moon,
    action: 'mindful'
  },
  {
    title: 'Nature Connection',
    description: 'Step outside or look out a window at nature for 2 minutes',
    icon: Leaf,
    action: 'nature'
  },
];

export const CopingStrategies = () => {
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);

  const handleStrategyClick = (action: string) => {
    switch (action) {
      case 'breathing':
        setIsBreathingModalOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Card className="p-6 bg-chat-navy border-chat-teal">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="text-chat-light animate-float" />
            <h2 className="text-xl font-semibold text-chat-gray">Coping Strategies</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {strategies.map((strategy) => (
              <Card 
                key={strategy.title} 
                className="p-4 bg-chat-dark/50 border-chat-teal/30 hover:bg-chat-navy/80 transition-colors duration-200"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <strategy.icon className="w-8 h-8 text-chat-light" />
                  <h3 className="font-medium text-chat-gray">{strategy.title}</h3>
                  <p className="text-sm text-chat-light">{strategy.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 border-chat-teal/30 text-chat-light hover:bg-chat-teal hover:text-white transition-colors duration-200"
                    onClick={() => handleStrategyClick(strategy.action)}
                  >
                    Try Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <BreathingExercisesModal 
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
      />
    </>
  );
};
