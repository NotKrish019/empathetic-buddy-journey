
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Youtube } from "lucide-react";

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
    ],
    videoUrl: "https://www.youtube.com/embed/PFxuPhn7nLc",
    timing: { inhale: 4, hold: 7, exhale: 8 }
  },
  {
    name: "Box Breathing",
    subtitle: "For Stress & Focus",
    description: "Used by Navy SEALs, this technique helps manage stress and improve concentration.",
    steps: [
      "Sit upright in a comfortable position",
      "Slowly exhale all air from your lungs",
      "Inhale slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale through your mouth for 4 counts",
      "Hold your breath for 4 counts",
      "Repeat for 4-5 cycles or until calm"
    ],
    videoUrl: "https://www.youtube.com/embed/tEmt1Znux58",
    timing: { inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4 }
  },
  {
    name: "Belly Breathing",
    subtitle: "For Relaxation",
    description: "A fundamental technique that promotes deep relaxation and reduces stress.",
    steps: [
      "Lie down or sit in a comfortable position",
      "Place one hand on your chest and the other on your belly",
      "Breathe in slowly through your nose, feeling your belly expand",
      "Keep your chest relatively still",
      "Purse your lips and exhale slowly through your mouth",
      "Feel your belly lower",
      "Repeat for 5-10 breaths"
    ],
    videoUrl: "https://www.youtube.com/embed/UB3tSaiEbNY",
    timing: { inhale: 4, exhale: 6 }
  },
  {
    name: "Alternate Nostril Breathing",
    subtitle: "For Balance",
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
    ],
    videoUrl: "https://www.youtube.com/embed/8VwufJrUhic",
    timing: { inhale: 4, exhale: 4 }
  },
  {
    name: "Energizing Breath",
    subtitle: "For Fatigue",
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
    ],
    videoUrl: "https://www.youtube.com/embed/aXItOY0sLRY",
    timing: { inhale: 1, exhale: 1 }
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
  const [animationActive, setAnimationActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfterExhale'>('inhale');
  const [showVideo, setShowVideo] = useState(false);
  const [phaseTime, setPhaseTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Control the breathing animation
  useEffect(() => {
    if (!animationActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setCurrentPhase('inhale');
      setPhaseTime(0);
      return;
    }

    const timing = selectedExercise.timing;
    let phaseDuration = 0;

    switch (currentPhase) {
      case 'inhale':
        phaseDuration = timing.inhale * 1000;
        break;
      case 'hold':
        phaseDuration = timing.hold * 1000;
        break;
      case 'exhale':
        phaseDuration = timing.exhale * 1000;
        break;
      case 'holdAfterExhale':
        phaseDuration = (timing.holdAfterExhale || 0) * 1000;
        break;
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / phaseDuration, 1);
      setPhaseTime(progress);

      if (bubbleRef.current) {
        if (currentPhase === 'inhale') {
          bubbleRef.current.style.transform = `scale(${0.5 + progress * 0.5})`;
        } else if (currentPhase === 'exhale') {
          bubbleRef.current.style.transform = `scale(${1 - progress * 0.5})`;
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Move to next phase
        let nextPhase: 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale' = 'inhale';
        
        switch (currentPhase) {
          case 'inhale':
            nextPhase = timing.hold ? 'hold' : 'exhale';
            break;
          case 'hold':
            nextPhase = 'exhale';
            break;
          case 'exhale':
            nextPhase = timing.holdAfterExhale ? 'holdAfterExhale' : 'inhale';
            break;
          case 'holdAfterExhale':
            nextPhase = 'inhale';
            break;
        }
        
        setCurrentPhase(nextPhase);
        setPhaseTime(0);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationActive, currentPhase, selectedExercise]);

  const toggleAnimation = () => {
    setAnimationActive(!animationActive);
  };

  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale': return 'Inhale';
      case 'hold': return 'Hold';
      case 'exhale': return 'Exhale';
      case 'holdAfterExhale': return 'Hold';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-chat-navy border-chat-teal shadow-lg p-0 overflow-hidden">
        <DialogHeader className="pb-4 pt-4 px-6 border-b border-chat-teal/30">
          <DialogTitle className="text-2xl font-semibold text-chat-gray">
            Breathing Exercises
          </DialogTitle>
          <DialogDescription className="text-chat-light">
            Select a breathing exercise based on your current needs
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 h-full pt-6 px-6 overflow-hidden">
          <div className="w-full md:w-1/3 space-y-3 md:pr-6 md:border-r border-chat-teal/30">
            {breathingExercises.map((exercise) => (
              <Button
                key={exercise.name}
                variant={selectedExercise.name === exercise.name ? "default" : "outline"}
                className={`w-full text-left justify-start px-4 py-3 rounded-lg ${
                  selectedExercise.name === exercise.name
                    ? "bg-chat-teal text-white border-chat-light"
                    : "border-chat-teal/50 text-chat-light hover:bg-chat-teal/20"
                }`}
                onClick={() => {
                  setSelectedExercise(exercise);
                  setAnimationActive(false);
                  setShowVideo(false);
                }}
              >
                <div>
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-xs opacity-80">{exercise.subtitle}</div>
                </div>
              </Button>
            ))}
          </div>
          
          <ScrollArea className="w-full md:w-2/3 h-[500px] pb-6">
            <div className="pr-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-chat-gray mb-2">
                  {selectedExercise.name}
                </h3>
                <p className="text-chat-light text-sm leading-relaxed">
                  {selectedExercise.description}
                </p>
              </div>
              
              {/* Interactive Breathing Animation */}
              <div className="relative bg-chat-dark/50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] border border-chat-teal/30">
                {!showVideo ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute rounded-full bg-chat-teal/30"
                          style={{
                            width: `${(i + 1) * 10}%`,
                            height: `${(i + 1) * 10}%`,
                            opacity: 0.1 + (i * 0.02),
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                    <div 
                      ref={bubbleRef}
                      className="relative z-10 w-32 h-32 rounded-full bg-chat-teal/40 flex items-center justify-center transition-transform duration-500 border-2 border-chat-teal/60 shadow-lg shadow-chat-teal/20"
                    >
                      <div className="text-white text-xl font-medium">
                        {animationActive ? getPhaseText() : "Ready"}
                      </div>
                    </div>
                    <div className="mt-8 space-x-4">
                      <Button
                        onClick={toggleAnimation}
                        className="bg-chat-teal hover:bg-chat-teal/80 text-white transition-colors"
                      >
                        {animationActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={toggleVideo}
                        variant="outline"
                        className="border-chat-teal/30 text-chat-light hover:bg-chat-teal/20"
                      >
                        <Youtube className="mr-2 h-4 w-4" />
                        Watch Video
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full aspect-video">
                      <iframe 
                        src={selectedExercise.videoUrl} 
                        className="w-full h-full rounded-md"
                        title={`${selectedExercise.name} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <Button
                      onClick={toggleVideo}
                      className="mt-4 bg-chat-teal hover:bg-chat-teal/80 text-white transition-colors"
                    >
                      Back to Interactive Guide
                    </Button>
                  </>
                )}
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
