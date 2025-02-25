
import { EmotionCheck } from "@/components/EmotionCheck";
import { WellnessProgress } from "@/components/WellnessProgress";
import { CopingStrategies } from "@/components/CopingStrategies";
import { AIChat } from "@/components/AIChat";
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
    <div className="min-h-screen bg-gradient-to-b from-chat-dark to-chat-navy p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-chat-navy/50 backdrop-blur-sm rounded-lg p-4 border border-chat-teal/30">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-chat-gray">Mental Wellness Buddy</h1>
            <p className="text-sm text-chat-light mt-1">
              Your compassionate companion for emotional well-being
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            size="sm"
            className="border-chat-teal/30 text-chat-light hover:bg-chat-teal/20"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>
        
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <EmotionCheck />
            <WellnessProgress />
          </div>
          <CopingStrategies />
          <AIChat />
        </div>
      </div>
    </div>
  );
};

export default Index;
