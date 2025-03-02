
import { EmotionCheck } from "@/components/EmotionCheck";
import { WellnessProgress } from "@/components/WellnessProgress";
import { CopingStrategies } from "@/components/CopingStrategies";
import { AIChat } from "@/components/AIChat";
import { PersonalizedCourseSection } from "@/components/PersonalizedCourseSection";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-chat-dark to-chat-navy p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-center bg-chat-navy/50 backdrop-blur-sm rounded-lg p-4 border border-chat-teal/30 shadow-lg">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-chat-gray">Mental Wellness Buddy</h1>
            <p className="text-xs md:text-sm text-chat-light mt-1">
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
        
        <div className="grid gap-4 md:gap-6">
          <PersonalizedCourseSection />
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <EmotionCheck />
            <WellnessProgress />
          </div>
          <CopingStrategies />
          <AIChat />
        </div>

        <footer className="text-center text-xs text-chat-light/50 py-4">
          <p>© {new Date().getFullYear()} Mental Wellness Buddy. Practice self-care daily.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
