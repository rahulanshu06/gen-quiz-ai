export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface QuizSettings {
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "mix";
  negativeMarking: boolean;
  penalty: number;
  totalQuestions: number;
  timerMinutes: number;
}

export interface QuizData {
  questions: QuizQuestion[];
  settings: QuizSettings;
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number | null;
  markedForReview: boolean;
  timeSpent: number;
}
