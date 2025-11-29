import { GrammarExample } from "@/types/grammar";

export interface WordTile {
  id: string;
  word: string;
  originalIndex: number;
}

export interface ConstructionQuestion {
  id: number;
  patternId: number;
  example: GrammarExample;
  correctOrder: string[];
  shuffledWords: WordTile[];
}

export interface ConstructionExerciseState {
  questions: ConstructionQuestion[];
  currentQuestionIndex: number;
  userAnswer: string[];
  isAnswerChecked: boolean;
  isCorrect: boolean | null;
  score: number;
  correctCount: number;
  wrongCount: number;
}
