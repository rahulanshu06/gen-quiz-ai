import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Play, BookOpen, Timer, GraduationCap, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Difficulty = "easy" | "medium" | "hard" | "mix";
type Penalty = -0.25 | -0.5 | -0.75 | -1.0;

const QuizGenerator = () => {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [timer, setTimer] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [penalty, setPenalty] = useState<Penalty>(-0.25);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      console.error("Error generating quiz:", error);
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-card backdrop-blur-sm rounded-3xl p-8 shadow-card border border-border/50">
        {/* Topic Input */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <Label htmlFor="topic" className="text-lg font-semibold">
              Topic / Subject
            </Label>
          </div>
          <Textarea
            id="topic"
            placeholder="Write detailed topic here... Example: JavaScript basics - variables, loops, functions, etc."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[120px] resize-none rounded-2xl border-2 focus:border-primary transition-smooth"
            disabled={isGenerating}
          />
          <p className="text-sm text-muted-foreground">
            Provide detailed topic description for better questions
          </p>
        </div>

        {/* Number of Questions and Timer */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-primary font-bold">#</span>
              </div>
              <Label htmlFor="numQuestions" className="font-semibold">
                No. of Questions
              </Label>
            </div>
            <Input
              id="numQuestions"
              type="number"
              min="1"
              max="50"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
              className="rounded-2xl border-2 h-12 text-center text-lg font-medium"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-primary" />
              <Label className="font-semibold">Timer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustTimer(-1)}
                className="rounded-full h-12 w-12"
                disabled={isGenerating}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 bg-secondary rounded-2xl h-12 flex items-center justify-center">
                <span className="text-lg font-semibold">{timer} min</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustTimer(1)}
                className="rounded-full h-12 w-12"
                disabled={isGenerating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Timer auto-adjusts: 1 min per question
            </p>
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <Label className="font-semibold">Difficulty Level</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["easy", "medium", "hard", "mix"] as Difficulty[]).map((level) => (
              <Button
                key={level}
                variant={difficulty === level ? "default" : "outline"}
                onClick={() => setDifficulty(level)}
                disabled={isGenerating}
                className={`rounded-2xl h-14 text-base font-medium transition-smooth ${
                  difficulty === level
                    ? level === "easy"
                      ? "bg-success hover:bg-success/90"
                      : level === "medium"
                      ? "bg-warning hover:bg-warning/90 text-warning-foreground"
                      : level === "hard"
                      ? "bg-destructive hover:bg-destructive/90"
                      : "bg-gradient-primary"
                    : ""
                }`}
              >
                <span className="mr-2">{difficultyConfig[level].icon}</span>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Negative Marking */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            <Label className="font-semibold">Negative Marking</Label>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-2xl">
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
                    className={`rounded-xl h-12 font-medium transition-smooth ${
                      penalty === p ? "bg-primary" : ""
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
          className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant"
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

