import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Play, BookOpen, Clock, GraduationCap } from "lucide-react";
import Header from "@/components/Header";

interface QuizData {
  topic: string;
  difficulty: string;
  total_questions: number;
  timer_minutes: number;
  negative_marking: boolean;
  penalty: number;
  questions_data: any;
}

const SharedQuiz = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [guestName, setGuestName] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchSharedQuiz = async () => {
      if (!token) {
        toast({
          title: "Invalid Link",
          description: "This quiz link is invalid",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        // Fetch shared quiz with quiz data
        const { data: sharedQuiz, error } = await supabase
          .from("shared_quizzes")
          .select(`
            *,
            quizzes (
              topic,
              difficulty,
              total_questions,
              timer_minutes,
              negative_marking,
              penalty,
              questions_data
            )
          `)
          .eq("share_token", token)
          .maybeSingle();

        if (error) throw error;

        if (!sharedQuiz || !sharedQuiz.quizzes) {
          toast({
            title: "Quiz Not Found",
            description: "This quiz link may have been deleted",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Increment view count
        await supabase
          .from("shared_quizzes")
          .update({ view_count: (sharedQuiz.view_count || 0) + 1 })
          .eq("id", sharedQuiz.id);

        setQuizData(sharedQuiz.quizzes as any);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load quiz",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedQuiz();
  }, [token, navigate, toast]);

  const handleStartQuiz = () => {
    if (!guestName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      return;
    }

    if (!quizData) return;

    setIsStarting(true);

    // Navigate to quiz with shared quiz data
    navigate("/quiz", {
      state: {
        quizData: {
          questions: quizData.questions_data,
          settings: {
            topic: quizData.topic,
            difficulty: quizData.difficulty,
            negativeMarking: quizData.negative_marking,
            penalty: quizData.penalty,
            totalQuestions: quizData.total_questions,
            timerMinutes: quizData.timer_minutes,
          },
        },
        isShared: true,
        shareToken: token,
        guestName: guestName.trim(),
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quizData) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-elegant">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
                  <BookOpen className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {quizData.topic}
                </h1>
                <p className="text-muted-foreground">
                  You've been invited to take this quiz
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-xl font-bold text-foreground">{quizData.total_questions}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-xl font-bold text-foreground">{quizData.timer_minutes} min</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <GraduationCap className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <p className="text-xl font-bold text-foreground capitalize">{quizData.difficulty}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="guest-name">Your Name</Label>
                  <Input
                    id="guest-name"
                    type="text"
                    placeholder="Enter your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="mt-2"
                    maxLength={50}
                  />
                </div>

                {quizData.negative_marking && (
                  <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
                    <p className="text-sm text-warning-foreground">
                      <strong>Note:</strong> This quiz has negative marking. 
                      Wrong answers will deduct {Math.abs(quizData.penalty)} points.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleStartQuiz}
                  disabled={isStarting || !guestName.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Starting Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SharedQuiz;
