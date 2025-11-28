import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SavedQuiz {
  id: string;
  topic: string;
  difficulty: string;
  total_questions: number;
  timer_minutes: number;
  created_at: string;
  questions_data: any;
  negative_marking: boolean;
  penalty: number;
}

const SavedQuizzes = () => {
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load saved quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Quiz deleted",
        description: "The quiz has been removed from your saved quizzes",
      });
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  const handleStartQuiz = (quiz: SavedQuiz) => {
    navigate("/quiz", {
      state: {
        quizData: {
          questions: quiz.questions_data,
          settings: {
            topic: quiz.topic,
            difficulty: quiz.difficulty,
            negativeMarking: quiz.negative_marking,
            penalty: quiz.penalty,
            totalQuestions: quiz.total_questions,
            timerMinutes: quiz.timer_minutes,
          },
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No saved quizzes yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generate your first quiz to see it here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => (
        <Card
          key={quiz.id}
          className="hover:shadow-md transition-all cursor-pointer group"
          onClick={() => handleStartQuiz(quiz)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate mb-1 group-hover:text-primary transition-colors">
                  {quiz.topic}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {quiz.total_questions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {quiz.timer_minutes} min
                  </span>
                  <span className="capitalize px-2 py-0.5 bg-secondary rounded-full">
                    {quiz.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDelete(quiz.id, e)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedQuizzes;
