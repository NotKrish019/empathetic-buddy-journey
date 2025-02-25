
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const breathingExercises = [
  {
    name: "4-7-8 Breathing",
    subtitle: "For Anxiety & Sleep",
    description: "This technique helps reduce anxiety and aids in falling asleep.",
    steps: [
      "Find a comfortable sitting or lying position",
      "Place the tip of your tongue behind your upper front teeth",
      "Exhale completely through your mouth, making a whoosh sound",
      "Close your mouth and inhale quietly through your nose for 4 counts",
      "Hold your breath for 7 counts",
      "Exhale completely through your mouth, making a whoosh sound, for 8 counts",
      "Repeat this cycle 3-4 times"
    ]
  },
  {
    name: "Box Breathing (For Stress & Focus)",
    description: "Used by Navy SEALs, this technique helps manage stress and improve concentration.",
    steps: [
      "Sit upright in a comfortable position",
      "Slowly exhale all air from your lungs",
      "Inhale slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale through your mouth for 4 counts",
      "Hold your breath for 4 counts",
      "Repeat for 4-5 cycles or until calm"
    ]
  },
  {
    name: "Belly Breathing (For Relaxation)",
    description: "A fundamental technique that promotes deep relaxation and reduces stress.",
    steps: [
      "Lie down or sit in a comfortable position",
      "Place one hand on your chest and the other on your belly",
      "Breathe in slowly through your nose, feeling your belly expand",
      "Keep your chest relatively still",
      "Purse your lips and exhale slowly through your mouth",
      "Feel your belly lower",
      "Repeat for 5-10 breaths"
    ]
  },
  {
    name: "Alternate Nostril Breathing (For Balance)",
    description: "This technique helps balance energy and calm the mind.",
    steps: [
      "Sit comfortably with your back straight",
      "Use your right thumb to close your right nostril",
      "Inhale deeply through your left nostril",
      "Close your left nostril with your ring finger",
      "Release your thumb and exhale through your right nostril",
      "Inhale through the right nostril",
      "Close it with your thumb",
      "Release your ring finger and exhale through your left nostril",
      "Repeat for 5-10 cycles"
    ]
  },
  {
    name: "Energizing Breath (For Fatigue)",
    description: "A technique to increase energy and alertness.",
    steps: [
      "Sit comfortably with your back straight",
      "Keep your mouth gently closed",
      "Take quick, short breaths through your nose",
      "Breathe in and out rapidly (2-3 cycles per second)",
      "Keep your breaths equal in duration",
      "Do this for 10-15 seconds initially",
      "Return to normal breathing",
      "Notice the increase in energy"
    ]
  }
];

interface BreathingExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreathingExercisesModal = ({
  isOpen,
  onClose
}: BreathingExercisesModalProps) => {
  const [selectedExercise, setSelectedExercise] = useState(breathingExercises[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col bg-chat-navy border-chat-teal">
        <DialogHeader className="pb-6 border-b border-chat-teal/30">
          <DialogTitle className="text-2xl font-semibold text-chat-gray">
            Breathing Exercises
          </DialogTitle>
          <DialogDescription className="text-chat-light">
            Select a breathing exercise based on your current needs
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 h-full pt-6">
          <div className="w-1/3 space-y-3 pr-6 border-r border-chat-teal/30">
            {breathingExercises.map((exercise) => (
              <Button
                key={exercise.name}
                variant={selectedExercise.name === exercise.name ? "default" : "outline"}
                className={`w-full text-left justify-start px-4 py-3 rounded-lg ${
                  selectedExercise.name === exercise.name
                    ? "bg-chat-teal text-white border-chat-light"
                    : "border-chat-teal/50 text-chat-light hover:bg-chat-teal/20"
                }`}
                onClick={() => setSelectedExercise(exercise)}
              >
                <div>
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-xs opacity-80">{exercise.subtitle}</div>
                </div>
              </Button>
            ))}
          </div>
          
          <ScrollArea className="w-2/3 h-[400px]">
            <div className="pr-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-chat-gray mb-2">
                  {selectedExercise.name}
                </h3>
                <p className="text-chat-light text-sm leading-relaxed">
                  {selectedExercise.description}
                </p>
              </div>
              
              <div className="bg-chat-dark/30 rounded-lg p-6">
                <h4 className="font-medium text-chat-gray mb-4">Steps to Follow:</h4>
                <ol className="space-y-4">
                  {selectedExercise.steps.map((step, index) => (
                    <li key={index} className="flex gap-4 text-chat-light">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-chat-teal/20 text-chat-light text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
