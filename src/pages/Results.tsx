import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Clock, CheckCircle2, XCircle, AlertCircle, Share2, RotateCcw, Home, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { QuizData } from "@/types/quiz";
import Header from "@/components/Header";

interface ResultsData {
  quizData: QuizData;
  answers: any[];
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTaken: number;
  isShared?: boolean;
  shareToken?: string;
  guestName?: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [quizSaved, setQuizSaved] = useState(false);

  const resultsData = location.state as ResultsData | undefined;
  const isShared = resultsData?.isShared;
  const shareToken = resultsData?.shareToken;
  const guestName = resultsData?.guestName;

  useEffect(() => {
    if (!resultsData) {
      toast({
        title: "No results found",
        description: "Please take a quiz first",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Auto-save for shared quizzes
    if (isShared && shareToken) {
      handleSaveSharedAttempt();
    }
  }, [resultsData, navigate, toast]);

  if (!resultsData) return null;

  const { quizData, answers, score, correctAnswers, wrongAnswers, unanswered, timeTaken } = resultsData;
  const percentage = ((correctAnswers / quizData.questions.length) * 100).toFixed(1);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveSharedAttempt = async () => {
    if (!shareToken) return;

    try {
      // Get the quiz_id from shared_quizzes
      const { data: sharedQuiz, error: sharedError } = await supabase
        .from("shared_quizzes")
        .select("quiz_id, id")
        .eq("share_token", shareToken)
        .single();

      if (sharedError) throw sharedError;

      // Save the attempt as guest
      const { error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: sharedQuiz.quiz_id,
          user_id: null,
          score,
          total_questions: quizData.questions.length,
          correct_answers: correctAnswers,
          wrong_answers: wrongAnswers,
          unanswered,
          time_taken_seconds: timeTaken,
          answers_data: answers as any,
          shared_quiz_token: shareToken,
          guest_name: guestName,
        });

      if (attemptError) throw attemptError;

      // Increment attempt count
      const { data: currentShared } = await supabase
        .from("shared_quizzes")
        .select("attempt_count")
        .eq("id", sharedQuiz.id)
        .single();

      if (currentShared) {
        await supabase
          .from("shared_quizzes")
          .update({ 
            attempt_count: (currentShared.attempt_count || 0) + 1
          })
          .eq("id", sharedQuiz.id);
      }

    } catch (error: any) {
      console.error("Error saving shared attempt:", error);
    }
  };

  const handleSaveQuiz = async () => {
    // Don't allow save for shared quizzes - already auto-saved
    if (isShared) {
      toast({
        title: "Already Saved",
        description: "Your attempt has been saved automatically",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save your quiz",
      });
      navigate("/auth");
      return;
    }

    setIsSaving(true);

    try {
      // First, save the quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert([{
          user_id: user.id,
          topic: quizData.settings.topic,
          difficulty: quizData.settings.difficulty,
          total_questions: quizData.settings.totalQuestions,
          timer_minutes: quizData.settings.timerMinutes,
          negative_marking: quizData.settings.negativeMarking,
          penalty: quizData.settings.penalty,
          questions_data: quizData.questions as any,
        }])
        .select()
        .single();

      if (quizError) throw quizError;

      // Then save the attempt
      const { error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert([{
          quiz_id: quiz.id,
          user_id: user.id,
          score,
          total_questions: quizData.questions.length,
          correct_answers: correctAnswers,
          wrong_answers: wrongAnswers,
          unanswered,
          time_taken_seconds: timeTaken,
          answers_data: answers as any,
        }]);

      if (attemptError) throw attemptError;

      setQuizSaved(true);
      toast({
        title: "Quiz Saved!",
        description: "Your results have been saved to your dashboard",
      });
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    navigate("/", { replace: true });
  };

  const handleShare = () => {
    const shareText = `I scored ${percentage}% (${correctAnswers}/${quizData.questions.length}) on "${quizData.settings.topic}" quiz! 🎯`;
    
    if (navigator.share) {
      navigator.share({
        title: "Quiz Results",
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share your results with friends",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Results Summary */}
          <div className="bg-gradient-card backdrop-blur-sm rounded-3xl p-8 shadow-card border border-border/50 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
              <p className="text-muted-foreground">{quizData.settings.topic}</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                  {percentage}%
                </div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div className="text-3xl font-bold text-success">{correctAnswers}</div>
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <div className="text-3xl font-bold text-destructive">{wrongAnswers}</div>
                </div>
                <div className="text-sm text-muted-foreground">Wrong</div>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-muted/10 to-muted/5 border-border">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="text-3xl font-bold">{formatTime(timeTaken)}</div>
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </Card>
            </div>

            {/* Quiz Settings Info */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Badge variant="outline" className="rounded-full px-4 py-1">
                <Trophy className="h-3 w-3 mr-1" />
                {quizData.settings.difficulty}
              </Badge>
              <Badge variant="outline" className="rounded-full px-4 py-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {quizData.questions.length} Questions
              </Badge>
              {quizData.settings.negativeMarking && (
                <Badge variant="destructive" className="rounded-full px-4 py-1">
                  <XCircle className="h-3 w-3 mr-1" />
                  Negative Marking: {quizData.settings.penalty}
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {!isShared && user && !quizSaved && (
                <Button
                  onClick={handleSaveQuiz}
                  disabled={isSaving}
                  className="rounded-full bg-gradient-primary px-8"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Quiz
                    </>
                  )}
                </Button>
              )}
              
              {isShared && (
                <div className="flex items-center gap-2 px-6 py-2 bg-success/10 text-success rounded-full border border-success/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Results saved as {guestName}</span>
                </div>
              )}
              
              {!user && !isShared && (
                <Button
                  onClick={() => navigate("/auth")}
                  className="rounded-full bg-gradient-primary px-8"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Login to Save
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleRetake}
                className="rounded-full px-8"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New Quiz
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                className="rounded-full px-8"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="rounded-full px-8"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Detailed Analysis</h2>
            </div>

            {quizData.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer.isCorrect;
              const selectedOption = userAnswer.selectedOption;
              const correctOption = question.correct_answer;

              return (
                <Card key={question.id} className="p-6 bg-gradient-card backdrop-blur-sm border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={isCorrect ? "default" : selectedOption === null ? "secondary" : "destructive"}>
                          Question {index + 1}
                        </Badge>
                        {isCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                        {!isCorrect && selectedOption !== null && <XCircle className="h-5 w-5 text-destructive" />}
                        {selectedOption === null && <AlertCircle className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>

                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optIdx) => {
                          const isSelected = selectedOption === optIdx;
                          const isCorrectOption = correctOption === optIdx;
                          const optionLabel = String.fromCharCode(65 + optIdx);

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border-2 ${
                                isCorrectOption
                                  ? "border-success bg-success/10"
                                  : isSelected
                                  ? "border-destructive bg-destructive/10"
                                  : "border-border"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    isCorrectOption
                                      ? "bg-success text-white"
                                      : isSelected
                                      ? "bg-destructive text-white"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {optionLabel}
                                </div>
                                <div className="flex-1">
                                  <span className={isCorrectOption || isSelected ? "font-medium" : ""}>
                                    {option}
                                  </span>
                                  {isSelected && (
                                    <span className="ml-2 text-sm text-muted-foreground">(Your answer)</span>
                                  )}
                                  {isCorrectOption && (
                                    <span className="ml-2 text-sm text-success font-medium">✓ Correct</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Separator className="my-4" />

                      <div className="bg-muted/30 rounded-xl p-4">
                        <h4 className="font-semibold mb-2 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                          Explanation:
                        </h4>
                        <p className="text-sm leading-relaxed">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
