import { useEffect, useState } from "react";
import { Loader2, Brain, Sparkles, CheckCircle2 } from "lucide-react";

interface QuizLoadingScreenProps {
  totalQuestions: number;
  topic: string;
}

const QuizLoadingScreen = ({ totalQuestions, topic }: QuizLoadingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { icon: Brain, text: "Analyzing topic...", delay: 500 },
    { icon: Sparkles, text: "Generating questions...", delay: 1000 },
    { icon: CheckCircle2, text: "Preparing your quiz...", delay: 800 },
  ];

  useEffect(() => {
    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) return prev + 1;
        return prev;
      });
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = steps[currentStep]?.icon || Brain;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="w-full px-6">
        {/* Main loading card */}
        <div className="bg-card rounded-3xl p-8 shadow-card border border-border animate-scale-in">
          {/* Animated icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative bg-gradient-primary rounded-full p-6">
                <CurrentIcon className="w-12 h-12 text-primary-foreground animate-pulse" />
              </div>
            </div>
          </div>

          {/* Topic */}
          <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Generating Quiz
          </h2>
          <p className="text-center text-muted-foreground mb-6 capitalize">
            {topic}
          </p>

          {/* Progress bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 transition-all duration-300 ${
                    isActive ? "scale-105" : "scale-100 opacity-60"
                  }`}
                >
                  <div
                    className={`rounded-full p-2 transition-colors duration-300 ${
                      isCompleted
                        ? "bg-success text-success-foreground"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.text}
                  </span>
                  {isActive && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Question count indicator */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>
                Preparing <span className="font-bold text-foreground">{totalQuestions}</span>{" "}
                questions
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLoadingScreen;