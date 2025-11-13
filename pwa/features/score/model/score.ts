export interface KanjiUserScore {
  userId: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  createdAt: string;
  updatedAt: string;

  // Individual Kanji mastery
  kanjiMastery: {
    [kanjiId: string]: KanjiMasteryLevel;
  };
}

export interface KanjiExerciseResult {
  kanjiId: string;
  kanji: string;
  wordId: string; // Unique word identifier (e.g., "hitotsu_1")
  word: string; // Actual word being tested (e.g., "一つ")
  exerciseType: ExerciseType;
  isCorrect: boolean;
}

// Individual kanji word tracking - the core unit of kanji scoring system
export interface KanjiWordLevel {
  wordId: string; // Unique identifier: "hitotsu_1", "ichinichi_1"
  word: string; // Actual word: "一つ", "一日"
  kanjiId: string; // Parent kanji ID: "1"

  // Kanji word scoring (0-100 total)
  masteryScore: number; // Aggregate score from all exercises
  exerciseScores: Record<ExerciseType, number>;

  // Essential learning metrics
  totalAttempts: number;
  correctAttempts: number;
  lastSeen: string;
}

export interface KanjiMasteryLevel {
  kanjiId: string;
  character: string;
  level: string;

  // Kanji word mastery collection
  words: { [wordId: string]: KanjiWordLevel };

  // COMPUTED: Essential derived data only
  overallScore: number; // Sum of all word masteryScores
  lastSeen: string; // Most recent across words
}

// Type definitions for word-based scoring
export type ExerciseType = "writing" | "reading" | "pairing";

// Legacy compatibility - can be removed in future
export interface LegacyKanjiResult {
  kanjiId: string;
  kanji: string;
  isCorrect: boolean;
}

// Constants for score calculation
export const EXERCISE_TYPES: ExerciseType[] = ["writing", "reading", "pairing"];
export const MAX_SCORE = 100;

// Default implementations for kanji word
export const DEFAULT_KANJI_WORD: Omit<
  KanjiWordLevel,
  "wordId" | "word" | "kanjiId"
> = {
  masteryScore: 0,
  exerciseScores: {
    writing: 0,
    reading: 0,
    pairing: 0,
  } as Record<ExerciseType, number>,
  totalAttempts: 0,
  correctAttempts: 0,
  lastSeen: new Date().toISOString(),
};

// Default implementations for kanji mastery
export const DEFAULT_KANJI_MASTERY: Omit<
  KanjiMasteryLevel,
  "kanjiId" | "character" | "level"
> = {
  words: {},
  overallScore: 0,
  lastSeen: new Date().toISOString(),
};
