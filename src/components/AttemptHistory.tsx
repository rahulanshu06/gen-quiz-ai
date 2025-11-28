import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
  answers_data: any;
  quizzes: {
    topic: string;
    difficulty: string;
  };
}

const AttemptHistory = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const { data, error } = await supabase
          .from("quiz_attempts")
          .select(`
            *,
            quizzes (
              topic,
              difficulty
            )
          `)
          .order("completed_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setAttempts(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load attempt history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  if (attempts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No quiz attempts yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete a quiz to see your history here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt) => {
        const percentage = (attempt.score / attempt.total_questions) * 100;
        return (
          <Card key={attempt.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate mb-1">
                    {attempt.quizzes.topic}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="capitalize px-2 py-0.5 bg-secondary rounded-full">
                      {attempt.quizzes.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(attempt.time_taken_seconds)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`font-semibold ${getScoreColor(percentage)}`}>
                      {percentage.toFixed(0)}% ({attempt.correct_answers}/{attempt.total_questions})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(attempt.completed_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Trophy className={`h-8 w-8 ${getScoreColor(percentage)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AttemptHistory;
