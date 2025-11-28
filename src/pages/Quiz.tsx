import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle2 } from "lucide-react";
import { QuizData, UserAnswer } from "@/types/quiz";
import { useToast } from "@/hooks/use-toast";

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const quizData = location.state?.quizData as QuizData | undefined;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!quizData) {
      toast({
        title: "No quiz data",
        description: "Please generate a quiz first",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Initialize answers array
    const initialAnswers: UserAnswer[] = quizData.questions.map((q) => ({
      questionId: q.id,
      selectedOption: null,
      markedForReview: false,
      timeSpent: 0,
    }));
    setAnswers(initialAnswers);

    // Set timer
    setTimeRemaining(quizData.settings.timerMinutes * 60);
  }, [quizData, navigate, toast]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  if (!quizData) return null;

  const currentQ = quizData.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      ...newAnswers[currentQuestion],
      selectedOption: optionIndex,
    };
    setAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      ...newAnswers[currentQuestion],
      markedForReview: !newAnswers[currentQuestion].markedForReview,
    };
    setAnswers(newAnswers);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Calculate results
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    
    const detailedAnswers = answers.map((answer, index) => {
      const question = quizData.questions[index];
      const isCorrect = answer.selectedOption === question.correct_answer;
      
      if (answer.selectedOption === null) {
        unanswered++;
      } else if (isCorrect) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
      
      return {
        ...answer,
        isCorrect,
        correctAnswer: question.correct_answer,
      };
    });

    const score = quizData.settings.negativeMarking
      ? correctAnswers + (wrongAnswers * quizData.settings.penalty)
      : correctAnswers;

    const timeTaken = (quizData.settings.timerMinutes * 60) - timeRemaining;

    navigate("/results", {
      state: {
        quizData,
        answers: detailedAnswers,
        score,
        correctAnswers,
        wrongAnswers,
        unanswered,
        timeTaken,
      },
    });
  };

  const getAnswerStatus = (index: number) => {
    const answer = answers[index];
    if (answer?.markedForReview) return "review";
    if (answer?.selectedOption !== null) return "answered";
    return "unanswered";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-success";
      case "review":
        return "bg-warning";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="bg-gradient-card backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{quizData.settings.topic}</h2>
              <p className="text-muted-foreground">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full">
                <Clock className="h-5 w-5" />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question */}
            <div className="bg-gradient-card backdrop-blur-sm rounded-3xl p-8 shadow-card border border-border/50">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-semibold leading-relaxed">
                  {currentQuestion + 1}. {currentQ.question}
                </h3>
                <Button
                  variant={currentAnswer?.markedForReview ? "default" : "outline"}
                  size="sm"
                  onClick={handleMarkForReview}
                  className="rounded-full"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {currentAnswer?.markedForReview ? "Marked" : "Mark"}
                </Button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = currentAnswer?.selectedOption === index;
                  const optionLabel = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-smooth ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {optionLabel}
                        </div>
                        <span className="flex-1 pt-1">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {currentQuestion === quizData.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-full bg-gradient-primary"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="rounded-full bg-gradient-primary"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-card backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 sticky top-24">
              <h4 className="font-semibold mb-4">Questions</h4>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {answers.map((_, index) => {
                  const status = getAnswerStatus(index);
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-smooth ${
                        isCurrent
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      } ${getStatusColor(status)} ${
                        status === "answered"
                          ? "text-success-foreground"
                          : status === "review"
                          ? "text-warning-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-success"></div>
                  <span className="text-muted-foreground">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-warning"></div>
                  <span className="text-muted-foreground">Marked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-muted"></div>
                  <span className="text-muted-foreground">Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
