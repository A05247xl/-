export interface QuizQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  explanation?: string;
  subject?: string;
  yearTerm?: string;
}

export interface EssayQuestion {
  id: string;
  question: string;
  keyPoints: string;
  fullAnswer?: string;
  subject?: string;
  yearTerm?: string;
}

export interface AppState {
  sheetId: string;
  quizQuestions: QuizQuestion[];
  essayQuestions: EssayQuestion[];
  isLoading: boolean;
  error: string | null;
}
