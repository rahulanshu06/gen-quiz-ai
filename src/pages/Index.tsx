import Header from "@/components/Header";
import QuizGenerator from "@/components/QuizGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI-Powered Quiz Generator
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Create personalized MCQ quizzes on any topic with AI assistance. 
              Perfect for students, teachers, and lifelong learners.
            </p>
          </div>

          <QuizGenerator />

          {/* How it Works Section */}
          <div id="how-to-use" className="mt-24 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Describe Your Topic",
                  description: "Enter detailed information about what you want to learn or test",
                },
                {
                  step: "2",
                  title: "Customize Settings",
                  description: "Set difficulty, number of questions, timer, and negative marking",
                },
                {
                  step: "3",
                  title: "Take Your Quiz",
                  description: "AI generates questions instantly. Take the quiz and get detailed analysis",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-gradient-card backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-primary text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-smooth">About</a>
              <a href="#" className="hover:text-primary transition-smooth">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-smooth">Contact Us</a>
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
