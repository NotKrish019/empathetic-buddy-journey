
import { EmotionCheck } from "@/components/EmotionCheck";
import { WellnessProgress } from "@/components/WellnessProgress";
import { CopingStrategies } from "@/components/CopingStrategies";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-mint to-wellness-sky p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Mental Wellness Buddy</h1>
            <p className="text-lg text-muted-foreground">
              Your compassionate companion for emotional well-being
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
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
