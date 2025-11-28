import Header from "@/components/Header";
import QuizGenerator from "@/components/QuizGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              AI-Powered Quiz Generator
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Create personalized MCQ quizzes on any topic with AI assistance. 
              Perfect for students, teachers, and lifelong learners.
            </p>
          </div>

          <QuizGenerator />

          {/* How it Works Section */}
          <div id="how-to-use" className="mt-32 max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-foreground">How It Works</h2>
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
                  className="bg-card rounded-3xl p-8 shadow-card border border-border hover:shadow-elegant transition-smooth"
                >
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl flex items-center justify-center mx-auto mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center">{item.title}</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-smooth font-medium">About</a>
              <a href="#" className="hover:text-foreground transition-smooth font-medium">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-smooth font-medium">Contact Us</a>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              © 2025 MCQ AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
