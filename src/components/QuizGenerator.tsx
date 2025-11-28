import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Play, BookOpen, Timer, GraduationCap, AlertCircle, Loader2, ListOrdered, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import QuizLoadingScreen from "./QuizLoadingScreen";
import { useAuth } from "@/contexts/AuthContext";

type Difficulty = "easy" | "medium" | "hard" | "mix";
type Penalty = -0.25 | -0.5 | -0.75 | -1.0;

const questionSchema = z.number().min(1).max(50);

const QuizGenerator = () => {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(0);
  const [timer, setTimer] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [penalty, setPenalty] = useState<Penalty>(-0.25);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNumQuestionsChange = (value: number) => {
    if (isNaN(value) || value === 0) {
      setNumQuestions(0);
      setTimer(0);
      return;
    }
    const validatedValue = Math.min(Math.max(value, 1), 50);
    setNumQuestions(validatedValue);
    // Auto-calculate timer: 1 minute per question
    setTimer(validatedValue);
  };

  const adjustTimer = (delta: number) => {
    const newValue = timer + delta;
    if (newValue >= 1 && newValue <= 300) {
      setTimer(newValue);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your quiz",
        variant: "destructive",
      });
      return;
    }

    if (numQuestions < 1 || numQuestions > 50) {
      toast({
        title: "Invalid Number",
        description: "Number of questions must be between 1 and 50",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      toast({
        title: "Generating Quiz...",
        description: "AI is creating your personalized quiz",
      });

      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: {
          topic: topic.trim(),
          numQuestions,
          difficulty,
          negativeMarking,
          penalty: negativeMarking ? penalty : 0,
        },
      });

      // Check for rate limit error
      if (data?.error === 'rate_limit_exceeded') {
        toast({
          title: "Free Limit Reached",
          description: "You've used all 5 free quiz generations. Please sign up or login to continue.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/auth")}
            >
              Sign Up / Login
            </Button>
          ),
        });
        setIsGenerating(false);
        return;
      }

      if (error) throw error;

      if (!data || !data.questions) {
        throw new Error("Invalid response from server");
      }

      toast({
        title: "Quiz Generated!",
        description: `Created ${data.questions.length} questions. Starting quiz...`,
      });

      // Navigate to quiz page with data
      setTimeout(() => {
        navigate("/quiz", {
          state: {
            quizData: {
              questions: data.questions,
              settings: {
                topic: topic.trim(),
                difficulty,
                negativeMarking,
                penalty: negativeMarking ? penalty : 0,
                totalQuestions: numQuestions,
                timerMinutes: timer,
              },
            },
          },
        });
      }, 500);
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const difficultyConfig = {
    easy: { color: "success", icon: "🟢" },
    medium: { color: "warning", icon: "🟡" },
    hard: { color: "destructive", icon: "🔴" },
    mix: { color: "primary", icon: "🎨" },
  };

  if (isGenerating) {
    return <QuizLoadingScreen totalQuestions={numQuestions} topic={topic.trim()} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
        {/* Topic Input */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <Label htmlFor="topic" className="text-base font-semibold">
              Topic / Subject
            </Label>
          </div>
          <Textarea
            id="topic"
            placeholder="Write detailed topic here... Example: JavaScript basics - variables, loops, functions, etc."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[120px] resize-none rounded-2xl border-2 focus:border-primary transition-smooth bg-background"
            disabled={isGenerating}
          />
          <p className="text-sm text-muted-foreground">
            Provide detailed topic description for better questions
          </p>
        </div>

        {/* Number of Questions and Timer - Side by Side */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ListOrdered className="w-4 h-4 text-primary" />
                <Label htmlFor="numQuestions" className="text-base font-semibold">
                  No. of Questions
                </Label>
              </div>
              <Input
                id="numQuestions"
                type="number"
                min="1"
                max="50"
                value={numQuestions || ""}
                onChange={(e) => handleNumQuestionsChange(parseInt(e.target.value) || 0)}
                placeholder=""
                className="rounded-2xl border-2 h-12 text-center text-lg font-medium bg-background"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary" />
                <Label className="text-base font-semibold">Timer</Label>
              </div>
              <div className="flex items-center space-x-2 h-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustTimer(-1)}
                  className="rounded-full h-10 w-10 flex-shrink-0"
                  disabled={isGenerating}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 flex items-center justify-center gap-1 text-lg font-semibold">
                  <span>{timer || 0}</span>
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustTimer(1)}
                  className="rounded-full h-10 w-10 flex-shrink-0"
                  disabled={isGenerating}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertCircle className="w-3 h-3" />
            <span>Timer auto-adjusts: 1 min per question</span>
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <Label className="text-base font-semibold">Difficulty Level</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["easy", "medium", "hard", "mix"] as Difficulty[]).map((level) => (
              <Button
                key={level}
                variant={difficulty === level ? "default" : "outline"}
                onClick={() => setDifficulty(level)}
                disabled={isGenerating}
                className={`rounded-full h-12 text-base font-semibold transition-smooth ${
                  difficulty === level
                    ? level === "easy"
                      ? "bg-success hover:bg-success/90 text-success-foreground"
                      : level === "medium"
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : level === "hard"
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      : "bg-dark-card hover:bg-dark-card/90 text-dark-card-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span className="mr-2">{difficultyConfig[level].icon}</span>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Negative Marking */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <Label className="text-base font-semibold">Negative Marking</Label>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-2xl">
            <Switch
              id="negative-marking"
              checked={negativeMarking}
              onCheckedChange={setNegativeMarking}
              disabled={isGenerating}
            />
            <Label htmlFor="negative-marking" className="text-base cursor-pointer">
              Enable Negative Marking
            </Label>
          </div>

          {negativeMarking && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-sm text-muted-foreground">
                Penalty per Wrong Answer
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {([-0.25, -0.5, -0.75, -1.0] as Penalty[]).map((p) => (
                  <Button
                    key={p}
                    variant={penalty === p ? "default" : "outline"}
                    onClick={() => setPenalty(p)}
                    disabled={isGenerating}
                    className={`rounded-full h-12 font-semibold transition-smooth ${
                      penalty === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-14 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth shadow-card"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Generate Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuizGenerator;

