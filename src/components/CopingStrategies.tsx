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
      // Other actions can be added here
      default:
        break;
    }
  };

  return (
    <>
      <Card className="p-6 bg-wellness-sky/50 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="text-red-400 animate-float" />
            <h2 className="text-xl font-semibold">Coping Strategies</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {strategies.map((strategy) => (
              <Card key={strategy.title} className="p-4 bg-white/50 backdrop-blur-sm">
                <div className="flex flex-col items-center text-center space-y-2">
                  <strategy.icon className="w-8 h-8 text-wellness-sage" />
                  <h3 className="font-medium">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
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
