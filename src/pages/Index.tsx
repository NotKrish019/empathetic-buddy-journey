
import { EmotionCheck } from "@/components/EmotionCheck";
import { WellnessProgress } from "@/components/WellnessProgress";
import { CopingStrategies } from "@/components/CopingStrategies";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-mint to-wellness-sky p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Mental Wellness Buddy</h1>
          <p className="text-lg text-muted-foreground">
            Your compassionate companion for emotional well-being
          </p>
        </header>
        
        <div className="grid gap-8">
          <EmotionCheck />
          <WellnessProgress />
          <CopingStrategies />
        </div>
      </div>
    </div>
  );
};

export default Index;
