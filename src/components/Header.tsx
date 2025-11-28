import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, User, Settings, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl font-bold text-foreground">
              mcqai
            </span>
            <span className="text-lg text-muted-foreground">.online</span>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full px-6 hover:bg-secondary"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  How to Use
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">How to Use MCQ AI</DialogTitle>
                  <DialogDescription className="text-base">
                    Follow these simple steps to create and take your quiz
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {[
                    {
                      step: "1",
                      title: "Describe Your Topic",
                      description: "Enter detailed information about what you want to learn or test your knowledge on. The more specific you are, the better the questions will be.",
                      icon: "✍️",
                    },
                    {
                      step: "2",
                      title: "Customize Settings",
                      description: "Fine-tune difficulty level, question count, timer duration, and scoring rules to match your needs.",
                      icon: "⚙️",
                    },
                    {
                      step: "3",
                      title: "Take Your Quiz",
                      description: "AI generates questions instantly. Complete the quiz and receive detailed performance analysis with explanations.",
                      icon: "🎯",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start p-4 rounded-xl bg-muted/50">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary font-bold text-lg flex items-center justify-center shadow-lg">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-foreground flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            {user && (
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="rounded-full px-6 hover:bg-secondary"
              >
                Dashboard
              </Button>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full hover:bg-secondary"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">How to Use MCQ AI</DialogTitle>
                  <DialogDescription>
                    Follow these simple steps
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
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
                    <div key={item.step} className="flex gap-3 items-start p-3 rounded-xl bg-muted/50">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-primary font-bold flex items-center justify-center shadow-lg">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1 text-foreground flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-secondary"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(user.user_metadata?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="rounded-full px-6 hover:bg-secondary"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button
                  className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
