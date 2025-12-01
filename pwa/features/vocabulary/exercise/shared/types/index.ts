// Shared types untuk vocabulary exercises
export interface VocabularyExerciseWord {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meanings: {
    en: string;
    id: string;
  };
}

export interface VocabularyGameState {
  allGameWords: VocabularyExerciseWord[]; // Global master data - all words for the entire game
  isRetryMode: boolean; // Global retry mode state
  score: number; // Global computed score
  isComplete: boolean; // Global game completion state
  correctAnswers: number; // Global correct answers count
  errorWords: Set<string>; // Global error words for penalty calculation
}

export interface VocabularyQuestionResult {
  wordId: number;
  word: string;
  categoryId: string;
  isCorrect: boolean;
  exerciseType: "reading" | "writing" | "pairing";
  timestamp: string;
}

export interface VocabularyGameInitializationParams {
  categoryId: number | null;
  level: string;
  shouldResetQuestionIndex?: boolean;
  selectedVocabularyIds?: number[];
}

// Specific types for pairing exercise
export interface VocabularyPairingWord extends VocabularyExerciseWord {
  // Additional pairing-specific fields if needed
}

export interface VocabularySelectedCard extends VocabularyPairingWord {
  type: "kanji" | "meaning";
}

export interface VocabularyPairingSectionState {
  currentSectionIndex: number;
  allSections: VocabularyPairingWord[][];
  gameWords: VocabularyPairingWord[]; // Current section words for UI rendering
  selectedCards: VocabularySelectedCard[]; // Current section UI interaction state
  matchedPairs: Set<string>; // Current section matched pairs
  errorCards: Set<string>; // Current section error cards
  errorWords: Set<string>; // Current section error words
}

// Specific types for reading/writing exercises
export interface VocabularyQuestion {
  id: number;
  word: VocabularyExerciseWord;
  // Question display properties
  japanese: string; // Can be kanji or hiragana depending on exercise
  hiragana?: string; // Optional hiragana reading for display
  options: string[];
  correctAnswer: string;
  questionType:
    | "hiragana-to-meaning"
    | "kanji-to-meaning"
    | "meaning-to-kanji"
    | "meaning-to-romaji"
    | "meaning-to-hiragana"
    | "audio-to-meaning";
}

export interface VocabularyQuestionState {
  currentQuestionIndex: number;
  allQuestions: VocabularyQuestion[];
  currentQuestion: VocabularyQuestion | null;
  userAnswers: Record<number, string>;
  completedQuestions: Set<number>;
}
