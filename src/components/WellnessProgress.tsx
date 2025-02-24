
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy } from 'lucide-react';

export const WellnessProgress = () => {
  // This would be connected to actual user data in a full implementation
  const progress = 65;
  const streakDays = 7;

  return (
    <Card className="p-6 bg-wellness-lavender/50 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500 animate-float" />
            <h2 className="text-xl font-semibold">Your Progress</h2>
          </div>
          <div className="flex items-center gap-1">
            <Award className="text-yellow-500" />
            <span className="font-medium">{streakDays} day streak!</span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-wellness-sage/30" />
        <p className="text-sm text-muted-foreground">
          Keep going! You're making great progress on your wellness journey.
        </p>
      </div>
    </Card>
  );
};
