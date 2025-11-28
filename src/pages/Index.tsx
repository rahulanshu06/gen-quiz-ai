import Header from "@/components/Header";
import QuizGenerator from "@/components/QuizGenerator";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeSection from "@/components/WelcomeSection";
import SavedQuizzes from "@/components/SavedQuizzes";
import AttemptHistory from "@/components/AttemptHistory";

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <Header />
      
      <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Welcome/Saved Quizzes/Attempts */}
            <div className="space-y-6 order-2 lg:order-1">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-48 bg-muted rounded-xl" />
                  <div className="h-32 bg-muted rounded-xl" />
                </div>
              ) : user ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Recent Quizzes
                    </h2>
                    <SavedQuizzes />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Attempt History
                    </h2>
                    <AttemptHistory />
                  </div>
                </>
              ) : (
                <WelcomeSection />
              )}
            </div>

            {/* Right Column - Quiz Generator */}
            <div className="order-1 lg:order-2">
              <QuizGenerator />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border bg-gradient-card py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                About
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                Privacy Policy
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                Contact Us
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 MCQ AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
