export interface UserScore {
  userId: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  createdAt: string;
  updatedAt: string;
  
  // Individual Kanji mastery (word-based)
  kanjiMastery: {
    [kanjiId: string]: KanjiMasteryLevel;
  };
}



export interface QuestionResult {
  kanjiId: string;
  kanji: string;
  wordId: string;           // Unique word identifier (e.g., "hitotsu_1")
  word: string;             // Actual word being tested (e.g., "一つ")
  exerciseType: "writing" | "reading" | "pairing";
  isCorrect: boolean;
}

// Word-level mastery tracking - the core unit of our scoring system
export interface WordMasteryLevel {
  wordId: string;           // Unique identifier: "hitotsu_1", "ichinichi_1"
  word: string;             // Actual word: "一つ", "一日"
  kanjiId: string;          // Parent kanji ID: "1"
  
  // Word-based scoring (0-100 total)
  masteryScore: number;     // Aggregate score from all exercises
  exerciseScores: {
    writing: number;        // 0 to (100/totalWordsInKanji/3)
    reading: number;        // 0 to (100/totalWordsInKanji/3)
    pairing: number;        // 0 to (100/totalWordsInKanji/3)
  };
  
  // Essential learning metrics
  totalAttempts: number;
  correctAttempts: number;
  lastSeen: string;
}

export interface KanjiMasteryLevel {
  kanjiId: string;
  character: string;
  level: string;
  
  // Word-based mastery collection
  words: { [wordId: string]: WordMasteryLevel };
  
  // COMPUTED: Essential derived data only
  overallScore: number;     // Sum of all word masteryScores
  colorCode: "red" | "orange" | "yellow" | "green";  // For UI visualization
  lastSeen: string;         // Most recent across words
}

export interface OverallProgress {
  currentLevel: string;
  totalKanjiLearned: number;
  totalWords: number;         // Total words encountered
  averageWordScore: number;   // Overall word mastery average
}

// Exercise result for word tracking
export interface WordExerciseResult {
  wordId: string;
  word: string;
  kanjiId: string;
  exerciseType: "writing" | "reading" | "pairing";
  isCorrect: boolean;
  scoreGained: number;          // Actual score gained from this attempt
}

// Type definitions for word-based scoring
export type ExerciseType = "writing" | "reading" | "pairing";  
export type ColorCode = "red" | "orange" | "yellow" | "green";

// Legacy QuestionResult for backward compatibility
export interface LegacyQuestionResult {
  kanjiId: string;
  kanji: string;
  isCorrect: boolean;
}

// NEW: Constants for scoring calculations
export const WORD_SCORING_CONSTANTS = {
  MAX_SCORE: 100,
  EXERCISE_COUNT: 3,
  MASTERY_THRESHOLDS: {
    MASTER: 80,
    GOOD: 60,
    NEEDS_PRACTICE: 40,
    WEAK: 0
  },
  COLOR_THRESHOLDS: {
    GREEN: 80,   // Mastered
    YELLOW: 60,  // Good progress
    ORANGE: 40,  // Needs practice
    RED: 0       // Weak/New
  }
} as const;

// Constants for score calculation
export const EXERCISE_TYPES: ExerciseType[] = ["writing", "reading", "pairing"];
export const MAX_SCORE = 100;

// Default implementations for word mastery
export const DEFAULT_WORD_MASTERY: Omit<WordMasteryLevel, 'wordId' | 'word' | 'kanjiId'> = {
  masteryScore: 0,
  exerciseScores: {
    writing: 0,
    reading: 0,
    pairing: 0
  },
  totalAttempts: 0,
  correctAttempts: 0,
  lastSeen: new Date().toISOString(),
};

// Default implementations for kanji mastery
export const DEFAULT_KANJI_MASTERY: Omit<KanjiMasteryLevel, 'kanjiId' | 'character' | 'level'> = {
  words: {},
  overallScore: 0,
  colorCode: "red",
  lastSeen: new Date().toISOString(),
};