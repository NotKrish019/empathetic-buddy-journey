
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Leaf, Moon, Sun } from 'lucide-react';

const strategies = [
  {
    title: 'Deep Breathing',
    description: 'Take 5 deep breaths, focusing on each inhale and exhale',
    icon: Sun,
  },
  {
    title: 'Mindful Moment',
    description: 'Notice 5 things you can see, 4 you can touch, 3 you can hear',
    icon: Moon,
  },
  {
    title: 'Nature Connection',
    description: 'Step outside or look out a window at nature for 2 minutes',
    icon: Leaf,
  },
];

export const CopingStrategies = () => {
  return (
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
                <Button variant="outline" className="w-full mt-2">
                  Try Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
};
