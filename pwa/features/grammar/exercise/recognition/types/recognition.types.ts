import { GrammarPattern, GrammarExample } from "@/types/grammar";

export interface RecognitionOption {
  patternId: number;
  patternName: string;
  japanese: string;
  description: string;
}

export interface RecognitionQuestion {
  id: number;
  example: GrammarExample;
  correctPatternId: number;
  options: RecognitionOption[];
}

export interface RecognitionExerciseState {
  questions: RecognitionQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  isAnswerChecked: boolean;
  isCorrect: boolean | null;
  score: number;
  correctCount: number;
  wrongCount: number;
}
