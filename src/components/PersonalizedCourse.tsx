
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, ChevronLeft, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

type CourseModule = {
  id: string;
  title: string;
  description: string;
  content: string;
  gender_focus: string;
  day_number: number;
};

type UserCourseProgress = {
  current_day: number;
  completed_days: number[];
  start_date: string;
};

const PersonalizedCourse = () => {
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserCourseProgress | null>(null);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [userGender, setUserGender] = useState<string>("");
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;

        // Get user questionnaire data to determine gender
        const { data: questionnaireData } = await supabase
          .from("user_questionnaire")
          .select("gender")
          .single();

        if (questionnaireData) {
          setUserGender(questionnaireData.gender);
        }

        // Get user progress
        const { data: progressData } = await supabase
          .from("user_course_progress")
          .select("current_day, completed_days, start_date")
          .single();

        if (progressData) {
          setUserProgress(progressData);
        } else {
          // Initialize progress if not exists
          const { data: newProgress } = await supabase
            .from("user_course_progress")
            .insert({
              user_id: sessionData.session.user.id,
              current_day: 1,
              completed_days: [],
              start_date: new Date().toISOString(),
              last_activity: new Date().toISOString(),
            })
            .select()
            .single();

          if (newProgress) {
            setUserProgress(newProgress);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Only fetch course modules once we know the user's gender
    if (userGender) {
      const fetchCourseModules = async () => {
        try {
          let query = supabase
            .from("course_modules")
            .select("*")
            .order("day_number", { ascending: true });

          // Filter by gender if not 'other'
          if (userGender !== "other") {
            query = query.eq("gender_focus", userGender);
          }

          const { data, error } = await query;

          if (error) throw error;
          if (data) {
            setCourseModules(data);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching course modules:", error);
          setLoading(false);
        }
      };

      fetchCourseModules();
    }
  }, [userGender]);

  useEffect(() => {
    // Set current module based on user progress and available modules
    if (userProgress && courseModules.length > 0) {
      const currentModuleData = courseModules.find(
        module => module.day_number === userProgress.current_day
      );
      
      if (currentModuleData) {
        setCurrentModule(currentModuleData);
      } else if (courseModules.length > 0) {
        // If current day module not found, default to first module
        setCurrentModule(courseModules[0]);
        // Update user progress to match
        updateCurrentDay(courseModules[0].day_number);
      }
    }
  }, [userProgress, courseModules]);

  const updateCurrentDay = async (dayNumber: number) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      await supabase
        .from("user_course_progress")
        .update({
          current_day: dayNumber,
          last_activity: new Date().toISOString(),
        })
        .eq("user_id", sessionData.session.user.id);

      if (userProgress) {
        setUserProgress({
          ...userProgress,
          current_day: dayNumber,
        });
      }
    } catch (error) {
      console.error("Error updating current day:", error);
    }
  };

  const markDayComplete = async () => {
    if (!currentModule || !userProgress || markingComplete) return;
    
    setMarkingComplete(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const dayNumber = currentModule.day_number;
      const completedDays = userProgress.completed_days || [];
      
      // Add the day if not already completed
      if (!completedDays.includes(dayNumber)) {
        const updatedCompletedDays = [...completedDays, dayNumber];
        
        await supabase
          .from("user_course_progress")
          .update({
            completed_days: updatedCompletedDays,
            last_activity: new Date().toISOString(),
          })
          .eq("user_id", sessionData.session.user.id);

        setUserProgress({
          ...userProgress,
          completed_days: updatedCompletedDays,
        });

        toast.success("Day completed! Great job!");
        
        // Move to next day if available
        const nextDayModule = courseModules.find(
          module => module.day_number === dayNumber + 1
        );
        
        if (nextDayModule) {
          updateCurrentDay(nextDayModule.day_number);
        }
      }
    } catch (error) {
      console.error("Error marking day complete:", error);
      toast.error("There was an error updating your progress.");
    } finally {
      setMarkingComplete(false);
    }
  };

  const navigateDay = (direction: "prev" | "next") => {
    if (!currentModule || !userProgress || courseModules.length === 0) return;
    
    const currentIndex = courseModules.findIndex(
      module => module.day_number === currentModule.day_number
    );
    
    if (direction === "prev" && currentIndex > 0) {
      updateCurrentDay(courseModules[currentIndex - 1].day_number);
    } else if (direction === "next" && currentIndex < courseModules.length - 1) {
      updateCurrentDay(courseModules[currentIndex + 1].day_number);
    }
  };

  const isDayCompleted = (dayNumber: number) => {
    return userProgress?.completed_days?.includes(dayNumber) || false;
  };

  if (loading) {
    return (
      <Card className="bg-chat-navy/50 backdrop-blur-sm border border-chat-teal/30 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-chat-light">Loading your personalized course...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (courseModules.length === 0) {
    return (
      <Card className="bg-chat-navy/50 backdrop-blur-sm border border-chat-teal/30 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-chat-light">No course modules available for your profile.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-chat-navy/50 backdrop-blur-sm border border-chat-teal/30 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-chat-gray">Your Personalized Course</CardTitle>
            {userProgress?.start_date && (
              <CardDescription className="text-chat-light flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Started on {format(new Date(userProgress.start_date), 'MMM d, yyyy')}
              </CardDescription>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-chat-teal/30 text-chat-light hover:bg-chat-teal/20"
              onClick={() => navigateDay("prev")}
              disabled={!currentModule || courseModules.findIndex(m => m.day_number === currentModule.day_number) === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-chat-teal/30 text-chat-light hover:bg-chat-teal/20"
              onClick={() => navigateDay("next")}
              disabled={!currentModule || courseModules.findIndex(m => m.day_number === currentModule.day_number) === courseModules.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {currentModule && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-chat-gray">
              Day {currentModule.day_number}: {currentModule.title}
            </h3>
            {isDayCompleted(currentModule.day_number) && (
              <div className="flex items-center text-green-500 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" /> Completed
              </div>
            )}
          </div>
          
          <p className="text-sm text-chat-light/80">{currentModule.description}</p>
          
          <Separator className="my-2 bg-chat-teal/20" />
          
          <div className="bg-chat-navy/30 p-4 rounded-md text-chat-light">
            {currentModule.content}
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="text-xs text-chat-light/70">
              {userProgress?.completed_days?.length || 0} of {courseModules.length} days completed
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={markDayComplete}
                disabled={isDayCompleted(currentModule.day_number) || markingComplete}
                className="bg-chat-teal hover:bg-chat-teal/80 text-white"
                size="sm"
              >
                {markingComplete ? "Updating..." : "Mark Complete"}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PersonalizedCourse;
