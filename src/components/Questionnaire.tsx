
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface QuestionnaireData {
  gender: string;
  emotional_pattern: number;
  attachment_level: number;
  stress_level: number;
  sleep_quality: number;
  exercise_frequency: number;
  social_support: number;
}

export const Questionnaire = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireData>({
    gender: "",
    emotional_pattern: 3,
    attachment_level: 3,
    stress_level: 3,
    sleep_quality: 3,
    exercise_frequency: 3,
    social_support: 3
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const updateFormData = (key: keyof QuestionnaireData, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.gender) {
      toast({
        title: "Required Field Missing",
        description: "Please select your gender identity to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('user_questionnaire')
        .upsert({
          user_id: user.user.id,
          ...formData,
          completed_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Also create an initial course progress entry
      const { error: progressError } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.user.id,
          current_day: 1,
          completed_days: [],
          start_date: new Date().toISOString(),
          last_activity: new Date().toISOString()
        });
      
      if (progressError) throw progressError;
      
      toast({
        title: "Questionnaire Completed",
        description: "Your personalized course is now ready!",
      });
      
      onComplete();
    } catch (error: any) {
      console.error("Error saving questionnaire:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderScale = (
    question: string, 
    field: keyof QuestionnaireData, 
    lowLabel: string, 
    highLabel: string
  ) => {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-chat-gray">{question}</h3>
        <div className="flex justify-between text-xs text-chat-light mb-1">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
        <RadioGroup 
          className="flex justify-between" 
          value={formData[field].toString()} 
          onValueChange={(value) => updateFormData(field, parseInt(value))}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="flex flex-col items-center">
              <RadioGroupItem 
                id={`${field}-${value}`} 
                value={value.toString()} 
                className="mb-1"
              />
              <Label htmlFor={`${field}-${value}`} className="text-xs">
                {value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-xl bg-chat-navy border-chat-teal">
      <CardHeader>
        <CardTitle className="text-center text-chat-gray">
          Personalize Your Wellness Journey
        </CardTitle>
        <CardDescription className="text-center text-chat-light">
          {step === 1 ? 
            "Let's get to know you better to customize your experience." : 
            `Step ${step} of 3 - Your answers help us tailor the course content to your needs.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-chat-gray">How do you identify?</h3>
            <RadioGroup 
              value={formData.gender} 
              onValueChange={(value) => updateFormData("gender", value)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem 
                  id="gender-male" 
                  value="male" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="gender-male"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-chat-teal/30 bg-chat-dark/50 p-4 hover:bg-chat-teal/10 hover:text-chat-gray peer-data-[state=checked]:border-chat-teal peer-data-[state=checked]:bg-chat-teal/20 [&:has([data-state=checked])]:border-chat-teal"
                >
                  <span className="text-lg font-semibold">Male</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  id="gender-female" 
                  value="female" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="gender-female"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-chat-teal/30 bg-chat-dark/50 p-4 hover:bg-chat-teal/10 hover:text-chat-gray peer-data-[state=checked]:border-chat-teal peer-data-[state=checked]:bg-chat-teal/20 [&:has([data-state=checked])]:border-chat-teal"
                >
                  <span className="text-lg font-semibold">Female</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {renderScale(
              "How would you rate your emotional awareness?",
              "emotional_pattern",
              "I rarely notice my emotions",
              "I'm very aware of my emotions"
            )}
            
            {renderScale(
              "How would you describe your emotional attachment in relationships?",
              "attachment_level",
              "Very independent",
              "Strongly attached"
            )}
            
            {renderScale(
              "How would you rate your current stress level?",
              "stress_level",
              "Very low",
              "Very high"
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {renderScale(
              "How would you rate your sleep quality?",
              "sleep_quality",
              "Poor",
              "Excellent"
            )}
            
            {renderScale(
              "How often do you exercise?",
              "exercise_frequency",
              "Rarely",
              "Daily"
            )}
            
            {renderScale(
              "How strong is your social support network?",
              "social_support",
              "Very limited",
              "Very strong"
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button 
            variant="outline" 
            onClick={prevStep}
            className="border-chat-teal/30 text-chat-light hover:bg-chat-teal/20"
          >
            Previous
          </Button>
        ) : (
          <div></div>
        )}
        
        {step < 3 ? (
          <Button 
            onClick={nextStep}
            disabled={step === 1 && !formData.gender}
            className="bg-chat-teal text-white hover:bg-chat-teal/90"
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-chat-teal text-white hover:bg-chat-teal/90"
          >
            {isSubmitting ? "Saving..." : "Complete"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
