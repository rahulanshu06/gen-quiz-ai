import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Target } from "lucide-react";

const WelcomeSection = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-elegant">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-2">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Welcome to MCQ AI
            </h2>
            <p className="text-muted-foreground text-lg">
              Create intelligent quizzes powered by AI in seconds
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={() => navigate("/auth")}
              >
                Sign Up Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                AI-Powered Generation
              </h3>
              <p className="text-sm text-muted-foreground">
                Create customized quizzes on any topic with intelligent question generation
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Track Your Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                Save quizzes and monitor your performance with detailed analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeSection;
