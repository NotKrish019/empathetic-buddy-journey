
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy } from 'lucide-react';

export const WellnessProgress = () => {
  // This would be connected to actual user data in a full implementation
  const progress = 65;
  const streakDays = 7;

  return (
    <Card className="p-6 bg-chat-navy border-chat-teal">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-chat-light animate-float" />
            <h2 className="text-xl font-semibold text-chat-gray">Your Progress</h2>
          </div>
          <div className="flex items-center gap-1">
            <Award className="text-chat-light" />
            <span className="font-medium text-chat-gray">{streakDays} day streak!</span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-chat-dark">
          <div className="h-full bg-chat-teal rounded-full" style={{ width: `${progress}%` }} />
        </Progress>
        <p className="text-sm text-chat-light">
          Keep going! You're making great progress on your wellness journey.
        </p>
      </div>
    </Card>
  );
};
