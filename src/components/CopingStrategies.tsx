
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Leaf, Moon, Sun, Wind } from 'lucide-react';
import { useState } from 'react';
import { BreathingExercisesModal } from './BreathingExercisesModal';
import { JournalEntryModal } from './JournalEntryModal';

const strategies = [
  {
    title: 'Deep Breathing',
    description: 'Interactive breathing exercises with guided animations',
    icon: Wind,
    action: 'breathing',
    color: 'from-blue-500/30 to-cyan-500/20'
  },
  {
    title: 'Mindful Moment',
    description: 'Notice 5 things you can see, 4 you can touch, 3 you can hear',
    icon: Moon,
    action: 'mindful',
    color: 'from-purple-500/30 to-indigo-500/20'
  },
  {
    title: 'Nature Connection',
    description: 'Step outside or look out a window at nature for 2 minutes',
    icon: Leaf,
    action: 'nature',
    color: 'from-green-500/30 to-emerald-500/20'
  },
];

export const CopingStrategies = () => {
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [journalModal, setJournalModal] = useState<{
    isOpen: boolean;
    type: 'mindful' | 'nature';
    title: string;
  }>({
    isOpen: false,
    type: 'mindful',
    title: '',
  });

  const handleStrategyClick = (action: string) => {
    switch (action) {
      case 'breathing':
        setIsBreathingModalOpen(true);
        break;
      case 'mindful':
        setJournalModal({
          isOpen: true,
          type: 'mindful',
          title: 'Mindful Moment Journal',
        });
        break;
      case 'nature':
        setJournalModal({
          isOpen: true,
          type: 'nature',
          title: 'Nature Connection Journal',
        });
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Card className="p-6 bg-chat-navy border-chat-teal shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 border-b border-chat-teal/30 pb-3">
            <Heart className="text-chat-teal animate-pulse" />
            <h2 className="text-xl font-semibold text-chat-gray">Coping Strategies</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy) => (
              <Card 
                key={strategy.title} 
                className={`group relative p-6 overflow-hidden bg-gradient-to-br ${strategy.color} border-chat-teal/30 hover:shadow-md hover:border-chat-teal/60 transition-all duration-300`}
              >
                <div className="absolute inset-0 bg-chat-dark/80 z-0"></div>
                <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                  <div className="p-3 rounded-full bg-chat-teal/10 border border-chat-teal/30 group-hover:bg-chat-teal/20 transition-colors duration-300">
                    <strategy.icon className="w-6 h-6 text-chat-light" />
                  </div>
                  <h3 className="font-medium text-lg text-chat-gray">{strategy.title}</h3>
                  <p className="text-sm text-chat-light leading-relaxed">{strategy.description}</p>
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

      <JournalEntryModal 
        isOpen={journalModal.isOpen}
        onClose={() => setJournalModal(prev => ({ ...prev, isOpen: false }))}
        type={journalModal.type}
        title={journalModal.title}
      />
    </>
  );
};
