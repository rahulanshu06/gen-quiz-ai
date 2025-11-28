import Header from "@/components/Header";
import QuizGenerator from "@/components/QuizGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <Header />
      
      <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-4xl">
          {/* Centered Quiz Generator */}
          <div>
            <QuizGenerator />
          </div>

          {/* How it Works - Below Form */}
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center">How It Works</h2>
            
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Describe Your Topic",
                  description: "Enter what you want to learn or test",
                  icon: "✍️",
                },
                {
                  step: "2",
                  title: "Customize Settings",
                  description: "Fine-tune difficulty, questions, and timer",
                  icon: "⚙️",
                },
                {
                  step: "3",
                  title: "Take Your Quiz",
                  description: "Get instant results and detailed analysis",
                  icon: "🎯",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary font-bold text-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-smooth">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border bg-gradient-card py-16 mt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-0">
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <h3 className="text-2xl font-bold text-foreground">MCQ AI</h3>
              <p className="text-muted-foreground max-w-xs text-center lg:text-left">
                Empowering learning through AI-generated quizzes
              </p>
            </div>
            
            <div className="flex items-center gap-8 text-base">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth font-medium hover:scale-105 transform">
                About
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth font-medium hover:scale-105 transform">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth font-medium hover:scale-105 transform">
                Contact
              </a>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/50 text-center">
            <p className="text-muted-foreground">
              © 2025 MCQ AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
