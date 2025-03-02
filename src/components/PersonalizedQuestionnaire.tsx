
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type QuestionnaireQuestion = {
  id: string;
  question: string;
  description?: string;
};

const PersonalizedQuestionnaire = ({ onComplete }: { onComplete: () => void }) => {
  const [gender, setGender] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  const questions: Record<string, QuestionnaireQuestion> = {
    emotional_pattern: {
      id: "emotional_pattern",
      question: "How would you rate your emotional awareness?",
      description: "Understanding and identifying your emotions",
    },
    attachment_level: {
      id: "attachment_level",
      question: "How would you describe your attachment style in relationships?",
    },
    stress_level: {
      id: "stress_level",
      question: "How do you typically handle stress?",
    },
    sleep_quality: {
      id: "sleep_quality",
      question: "How would you rate your sleep quality?",
    },
    exercise_frequency: {
      id: "exercise_frequency",
      question: "How often do you engage in physical exercise?",
    },
    social_support: {
      id: "social_support",
      question: "How would you rate your social support network?",
    },
  };

  // Check if user has already completed the questionnaire
  useEffect(() => {
    const checkExistingQuestionnaire = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;

        const { data } = await supabase
          .from("user_questionnaire")
          .select("*")
          .single();

        if (data) {
          setHasCompletedQuestionnaire(true);
          setGender(data.gender);
          
          // Pre-fill responses
          const responseData: Record<string, number> = {};
          Object.keys(questions).forEach(key => {
            if (data[key] !== null) {
              responseData[key] = data[key];
            }
          });
          setResponses(responseData);
        }
      } catch (error) {
        console.error("Error checking questionnaire:", error);
      }
    };

    checkExistingQuestionnaire();
  }, []);

  const handleSubmit = async () => {
    if (!gender) {
      toast.error("Please select your gender identity");
      return;
    }

    if (Object.keys(responses).length < 3) {
      toast.error("Please answer at least 3 questions");
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("You must be logged in to complete the questionnaire");
        return;
      }

      const userId = sessionData.session.user.id;

      // Save questionnaire responses
      await supabase.from("user_questionnaire").upsert({
        user_id: userId,
        gender,
        ...responses,
        completed_at: new Date().toISOString(),
      });

      // Initialize or update course progress
      await supabase.from("user_course_progress").upsert({
        user_id: userId,
        current_day: 1,
        start_date: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      });

      toast.success("Questionnaire completed! Your personalized course is ready.");
      onComplete();
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      toast.error("There was an error saving your responses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderRatingOptions = (questionId: string) => {
    return (
      <RadioGroup
        value={responses[questionId]?.toString()}
        onValueChange={(value) => {
          setResponses({
            ...responses,
            [questionId]: parseInt(value),
          });
        }}
        className="flex space-x-1 mt-2"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center">
            <RadioGroupItem
              value={value.toString()}
              id={`${questionId}-${value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`${questionId}-${value}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-chat-teal/30 bg-chat-navy/30 text-chat-light peer-data-[state=checked]:bg-chat-teal/40 peer-data-[state=checked]:text-white cursor-pointer hover:bg-chat-navy/50"
            >
              {value}
            </Label>
            {value === 1 && <span className="text-xs mt-1">Low</span>}
            {value === 5 && <span className="text-xs mt-1">High</span>}
          </div>
        ))}
      </RadioGroup>
    );
  };

  return (
    <Card className="bg-chat-navy/50 backdrop-blur-sm border border-chat-teal/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-chat-gray">Personalize Your Course</CardTitle>
        <CardDescription className="text-chat-light">
          Answer a few questions to customize your wellness journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-chat-light">What gender do you identify as?</Label>
          <RadioGroup
            value={gender}
            onValueChange={setGender}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="text-chat-light">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="text-chat-light">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="text-chat-light">Other</Label>
            </div>
          </RadioGroup>
        </div>
        
        <Separator className="my-4 bg-chat-teal/20" />
        
        {Object.values(questions).map((q) => (
          <div key={q.id} className="space-y-2">
            <Label className="text-chat-light">{q.question}</Label>
            {q.description && (
              <p className="text-xs text-chat-light/70">{q.description}</p>
            )}
            {renderRatingOptions(q.id)}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-chat-teal hover:bg-chat-teal/80 text-white"
        >
          {loading ? "Saving..." : hasCompletedQuestionnaire ? "Update Responses" : "Complete Questionnaire"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalizedQuestionnaire;
