import Header from "@/components/Header";
import QuizGenerator from "@/components/QuizGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <Header />
      
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-20 space-y-8 animate-scale-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-semibold text-foreground">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-foreground leading-[1.1] tracking-tight">
              Master Any Subject<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                With AI Quizzes
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed">
              Generate personalized multiple-choice quizzes instantly.
              <br className="hidden lg:block" />
              Perfect for students, educators, and lifelong learners.
            </p>
          </div>

          {/* Quiz Generator Card */}
          <div className="max-w-4xl mx-auto mb-32">
            <QuizGenerator />
          </div>

          {/* How it Works Section */}
          <div id="how-to-use" className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                Three Simple Steps
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create your perfect quiz in seconds
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  step: "1",
                  title: "Describe Your Topic",
                  description: "Enter detailed information about what you want to learn or test your knowledge on",
                  icon: "✍️",
                },
                {
                  step: "2",
                  title: "Customize Settings",
                  description: "Fine-tune difficulty level, question count, timer duration, and scoring rules",
                  icon: "⚙️",
                },
                {
                  step: "3",
                  title: "Take Your Quiz",
                  description: "AI generates questions instantly. Complete the quiz and receive detailed performance analysis",
                  icon: "🎯",
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="relative group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-gradient-card rounded-3xl p-10 shadow-card border border-border hover:shadow-elegant transition-smooth hover:scale-105 h-full">
                    <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-smooth">
                      {item.icon}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-center text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-center leading-relaxed text-lg">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Connector line for desktop */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-12 w-12 lg:w-24 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
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
