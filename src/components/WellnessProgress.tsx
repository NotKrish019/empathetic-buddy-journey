
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface StreakData {
  current_streak: number;
  highest_streak: number;
  last_login: string;
}

export const WellnessProgress = () => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const { toast } = useToast();

  const checkAndUpdateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, get the current streak data
      const { data: streakData, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching streak:', fetchError);
        return;
      }

      if (!streakData) {
        // If no streak data exists, create it
        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert([{ id: user.id, current_streak: 1, highest_streak: 1 }]);

        if (insertError) {
          console.error('Error creating streak:', insertError);
          return;
        }

        setStreakData({ current_streak: 1, highest_streak: 1, last_login: new Date().toISOString() });
        return;
      }

      // Check if the last login was yesterday
      const lastLogin = new Date(streakData.last_login);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Reset streak if last login was more than a day ago
      const isConsecutiveDay = lastLogin.toDateString() === yesterday.toDateString();
      const isToday = lastLogin.toDateString() === today.toDateString();

      let newStreak = streakData.current_streak;
      if (!isConsecutiveDay && !isToday) {
        newStreak = 1;
        toast({
          title: "Streak Reset!",
          description: "Welcome back! Your streak has been reset to 1 day.",
        });
      } else if (!isToday) {
        newStreak = streakData.current_streak + 1;
        toast({
          title: "Streak Increased!",
          description: `You're on a ${newStreak} day streak! Keep it up!`,
        });
      }

      // Update the streak in the database
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          highest_streak: Math.max(newStreak, streakData.highest_streak),
          last_login: today.toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating streak:', updateError);
        return;
      }

      setStreakData({
        current_streak: newStreak,
        highest_streak: Math.max(newStreak, streakData.highest_streak),
        last_login: today.toISOString()
      });
    } catch (error) {
      console.error('Error in checkAndUpdateStreak:', error);
    }
  };

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  // Calculate progress as percentage of current streak vs highest streak
  const progress = streakData 
    ? (streakData.current_streak / Math.max(streakData.highest_streak, 1)) * 100
    : 0;

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
            <span className="font-medium text-chat-gray">
              {streakData?.current_streak || 0} day streak!
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-chat-dark">
          <div className="h-full bg-chat-teal rounded-full" style={{ width: `${progress}%` }} />
        </Progress>
        <div className="text-sm text-chat-light space-y-1">
          <p>Current Streak: {streakData?.current_streak || 0} days</p>
          <p>Highest Streak: {streakData?.highest_streak || 0} days</p>
          <p className="mt-2">
            {streakData?.current_streak === 0 
              ? "Start your streak by logging in daily!"
              : "Keep going! Log in daily to maintain your streak."}
          </p>
        </div>
      </div>
    </Card>
  );
};
