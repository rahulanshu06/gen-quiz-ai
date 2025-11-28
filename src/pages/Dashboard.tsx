import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Clock,
  Target,
  BookOpen,
  Play,
  Trash2,
  Calendar,
  TrendingUp,
  Search,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  time_taken_seconds: number;
  completed_at: string;
  quizzes: {
    topic: string;
    difficulty: string;
    questions_data: any;
    negative_marking: boolean | null;
    penalty: number | null;
    timer_minutes: number;
  };
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "passed" | "failed">("all");

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Login Required",
        description: "Please login to view your dashboard",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (user) {
      fetchAttempts();
    }
  }, [user]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select(`
          *,
          quizzes (
            topic,
            difficulty,
            questions_data,
            negative_marking,
            penalty,
            timer_minutes
          )
        `)
        .eq("user_id", user!.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error: any) {
      console.error("Error fetching attempts:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttempt = async (attemptId: string) => {
    try {
      const { error } = await supabase
        .from("quiz_attempts")
        .delete()
        .eq("id", attemptId);

      if (error) throw error;

      setAttempts(attempts.filter((a) => a.id !== attemptId));
      toast({
        title: "Deleted",
        description: "Quiz attempt deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete quiz attempt",
        variant: "destructive",
      });
    }
  };

  const handleRetakeQuiz = (attempt: QuizAttempt) => {
    navigate("/quiz", {
      state: {
        quizData: {
          questions: attempt.quizzes.questions_data,
          settings: {
            topic: attempt.quizzes.topic,
            difficulty: attempt.quizzes.difficulty,
            totalQuestions: attempt.total_questions,
            timerMinutes: attempt.quizzes.timer_minutes || Math.ceil(attempt.time_taken_seconds / 60),
            negativeMarking: attempt.quizzes.negative_marking || false,
            penalty: attempt.quizzes.penalty || 0,
          },
        },
      },
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalQuizzes = attempts.length;
  const totalCorrect = attempts.reduce((sum, a) => sum + a.correct_answers, 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + a.total_questions, 0);
  const averageScore = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;
  const totalTimeSpent = attempts.reduce((sum, a) => sum + a.time_taken_seconds, 0);
  const totalTimeMinutes = Math.floor(totalTimeSpent / 60);

  // Find favorite topic
  const topicCounts = attempts.reduce((acc, a) => {
    acc[a.quizzes.topic] = (acc[a.quizzes.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const favoriteTopic = Object.keys(topicCounts).length > 0
    ? Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0]
    : "None";

  // Filter attempts
  const filteredAttempts = attempts
    .filter((attempt) => {
      const passPercentage = (attempt.correct_answers / attempt.total_questions) * 100;
      if (filterTab === "passed" && passPercentage < 50) return false;
      if (filterTab === "failed" && passPercentage >= 50) return false;
      if (searchQuery) {
        return attempt.quizzes.topic.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-success text-success-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "hard": return "bg-destructive text-destructive-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name || "User"}! 👋
            </h1>
            <p className="text-muted-foreground">Track your progress and review past quizzes</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-card backdrop-blur-sm border-border/50 p-6 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold">{totalQuizzes}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <div className="mt-2 flex items-center text-xs text-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                Keep it up!
              </div>
            </Card>

            <Card className="bg-gradient-card backdrop-blur-sm border-border/50 p-6 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-success" />
                <span className="text-3xl font-bold">{averageScore}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary transition-all"
                  style={{ width: `${averageScore}%` }}
                />
              </div>
            </Card>

            <Card className="bg-gradient-card backdrop-blur-sm border-border/50 p-6 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-warning" />
                <span className="text-3xl font-bold">{totalTimeMinutes}</span>
              </div>
              <p className="text-sm text-muted-foreground">Minutes Spent</p>
              <p className="text-xs text-muted-foreground mt-2">
                Learning time invested
              </p>
            </Card>

            <Card className="bg-gradient-card backdrop-blur-sm border-border/50 p-6 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Favorite Topic</p>
              <p className="font-semibold text-lg truncate">{favoriteTopic}</p>
            </Card>
          </div>

          {/* Quiz History */}
          <Card className="bg-gradient-card backdrop-blur-sm border-border/50 p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Quiz History</h2>
              <Button
                onClick={() => navigate("/")}
                className="rounded-full bg-gradient-primary"
              >
                <Play className="mr-2 h-4 w-4" />
                New Quiz
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as any)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="passed">Passed</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Quiz List */}
            {filteredAttempts.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "Try a different search term" : "Start by generating your first quiz!"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate("/")}
                    className="rounded-full bg-gradient-primary"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAttempts.map((attempt) => {
                  const percentage = ((attempt.correct_answers / attempt.total_questions) * 100).toFixed(0);
                  const isPassed = parseFloat(percentage) >= 50;

                  return (
                    <Card key={attempt.id} className="p-6 border-border/50 hover:border-primary/50 transition-smooth">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{attempt.quizzes.topic}</h3>
                            <Badge className={getDifficultyColor(attempt.quizzes.difficulty)}>
                              {attempt.quizzes.difficulty}
                            </Badge>
                            <Badge variant={isPassed ? "default" : "secondary"}>
                              {percentage}%
                            </Badge>
                            {attempt.quizzes.negative_marking && (
                              <Badge variant="destructive" className="text-xs">
                                Penalty: {attempt.quizzes.penalty}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              {attempt.correct_answers}/{attempt.total_questions} correct
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(new Date(attempt.completed_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetakeQuiz(attempt)}
                            className="rounded-full"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Retake
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttempt(attempt.id)}
                            className="rounded-full text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
