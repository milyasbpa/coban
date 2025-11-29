import { GrammarExample } from "@/types/grammar";

export interface FillingQuestion {
  id: number;
  patternId: number;
  example: GrammarExample;
  blankIndex: number; // Index of the blank in the sentence parts
  correctAnswer: string;
  options: string[];
  sentenceParts: string[]; // Sentence split by blank position
}

export interface FillingExerciseState {
  questions: FillingQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  isAnswerChecked: boolean;
  isCorrect: boolean | null;
  score: number;
  correctCount: number;
  wrongCount: number;
  completedQuestions: number[];
}

export type AnswerStatus = "idle" | "correct" | "wrong";
