
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, BookOpen, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Questionnaire } from "./Questionnaire";

interface CourseModule {
  id: string;
  title: string;
  description: string;
  gender_focus: string;
  day_number: number;
  content: string;
}

interface CourseProgress {
  current_day: number;
  completed_days: number[];
  start_date: string;
}

export const CourseSection = () => {
  const [loading, setLoading] = useState(true);
  const [questionnairePending, setQuestionnairePending] = useState(false);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkQuestionnaire();
  }, []);

  const checkQuestionnaire = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      // Check if user has completed questionnaire
      const { data: questionnaireData } = await supabase
        .from('user_questionnaire')
        .select('gender')
        .single();

      if (!questionnaireData) {
        setQuestionnairePending(true);
        setLoading(false);
        return;
      }

      setUserGender(questionnaireData.gender);

      // Get course progress
      const { data: progressData } = await supabase
        .from('user_course_progress')
        .select('*')
        .single();

      if (progressData) {
        setProgress({
          current_day: progressData.current_day,
          completed_days: progressData.completed_days,
          start_date: progressData.start_date,
        });
      }

      // Get course modules for the user's gender
      const { data: modulesData, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('gender_focus', questionnaireData.gender)
        .order('day_number', { ascending: true });

      if (error) throw error;
      
      setModules(modulesData);
      
      // Set current module
      if (progressData && modulesData.length > 0) {
        const currentModuleData = modulesData.find(
          (mod) => mod.day_number === progressData.current_day
        );
        setCurrentModule(currentModuleData || modulesData[0]);
      }
    } catch (error) {
      console.error("Error loading course data:", error);
      toast({
        title: "Error",
        description: "Failed to load your course data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = () => {
    setQuestionnairePending(false);
    checkQuestionnaire();
  };

  const markModuleComplete = async () => {
    if (!currentModule || !progress) return;
    
    try {
      const newCompletedDays = [...progress.completed_days];
      if (!newCompletedDays.includes(currentModule.day_number)) {
        newCompletedDays.push(currentModule.day_number);
      }
      
      const nextDay = currentModule.day_number + 1;
      const hasNextModule = modules.some(mod => mod.day_number === nextDay);
      
      const { error } = await supabase
        .from('user_course_progress')
        .update({
          completed_days: newCompletedDays,
          current_day: hasNextModule ? nextDay : currentModule.day_number,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      
      setProgress({
        ...progress,
        completed_days: newCompletedDays,
        current_day: hasNextModule ? nextDay : currentModule.day_number
      });
      
      if (hasNextModule) {
        const nextModule = modules.find(mod => mod.day_number === nextDay);
        setCurrentModule(nextModule || null);
      }
      
      toast({
        title: "Progress Saved",
        description: hasNextModule 
          ? "Great job! Moving to the next module." 
          : "Module completed! You've finished all available modules for now.",
      });
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectModule = (module: CourseModule) => {
    setCurrentModule(module);
  };

  if (loading) {
    return (
      <Card className="bg-chat-navy border-chat-teal">
        <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chat-teal"></div>
        </CardContent>
      </Card>
    );
  }

  if (questionnairePending) {
    return <Questionnaire onComplete={handleQuestionnaireComplete} />;
  }

  return (
    <Card className="bg-chat-navy border-chat-teal">
      <CardHeader>
        <CardTitle className="text-chat-gray flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-chat-teal" />
          Personalized Wellness Course
        </CardTitle>
        <CardDescription className="text-chat-light">
          A tailored 30-day program to improve your mental well-being
        </CardDescription>
      </CardHeader>
      <Separator className="bg-chat-teal/20" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="p-4 border-r border-chat-teal/20 md:col-span-1 overflow-auto max-h-[400px]">
          <h3 className="text-chat-gray font-medium mb-4">Your Modules</h3>
          <div className="space-y-3">
            {modules.map((module) => {
              const isCompleted = progress?.completed_days.includes(module.day_number);
              const isCurrent = progress?.current_day === module.day_number;
              
              return (
                <div
                  key={module.id}
                  className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors 
                    ${isCurrent ? 'bg-chat-teal/20 border border-chat-teal/50' : 'hover:bg-chat-teal/10'}`}
                  onClick={() => selectModule(module)}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-chat-teal shrink-0 mt-0.5" />
                  ) : (
                    <Circle className={`h-5 w-5 shrink-0 mt-0.5 ${isCurrent ? 'text-chat-teal' : 'text-chat-light/50'}`} />
                  )}
                  <div>
                    <p className="text-sm font-medium text-chat-gray">Day {module.day_number}: {module.title}</p>
                    <p className="text-xs text-chat-light/80">{module.description}</p>
                  </div>
                </div>
              );
            })}
            {modules.length === 0 && (
              <p className="text-chat-light/70 text-sm italic">No modules available yet. Please check back later.</p>
            )}
          </div>
        </div>
        <div className="p-6 md:col-span-2">
          {currentModule ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-chat-gray mb-1">
                  Day {currentModule.day_number}: {currentModule.title}
                </h3>
                <p className="text-sm text-chat-light/80 mb-4">{currentModule.description}</p>
                <div className="bg-chat-dark/30 p-4 rounded-md border border-chat-teal/30 text-chat-light whitespace-pre-line">
                  {currentModule.content}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={markModuleComplete}
                  className="bg-chat-teal text-white hover:bg-chat-teal/90"
                  disabled={progress?.completed_days.includes(currentModule.day_number)}
                >
                  {progress?.completed_days.includes(currentModule.day_number) ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed</span>
                    </div>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-10">
              <Award className="h-16 w-16 text-chat-teal/50" />
              <h3 className="text-xl font-medium text-chat-gray">No Module Selected</h3>
              <p className="text-chat-light/70 text-center max-w-md">
                Please select a module from the list to view its content.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
