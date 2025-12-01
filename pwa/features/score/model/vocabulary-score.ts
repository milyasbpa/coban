export interface VocabularyUserScore {
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Nested: level -> categoryId -> vocabularyId
  vocabularyMastery: {
    [level: string]: {
      [categoryId: string]: {
        [vocabularyId: string]: VocabularyMasteryLevel;
      };
    };
  };
}

export interface VocabularyExerciseResult {
  vocabularyId: string;
  kanji: string; // The vocabulary word (e.g., "具合")
  hiragana: string; // Reading (e.g., "ぐあい")
  romaji: string; // Romanization (e.g., "guai")
  categoryId: string; // Category identifier (e.g., "1" or "ANGKA")
  exerciseType: VocabularyExerciseType;
  isCorrect: boolean;
  level: "N5" | "N4" | "N3" | "N2" | "N1"; // Level context for per-vocabulary scoring
}

// Individual vocabulary word tracking - the core unit of vocabulary scoring system
export interface VocabularyMasteryLevel {
  vocabularyId: string;
  kanji: string; // The vocabulary word (e.g., "具合")
  hiragana: string; // Reading (e.g., "ぐあい")
  romaji: string; // Romanization (e.g., "guai")
  level: string;
  categoryId: string; // Category identifier (e.g., "PERGAULAN & PERASAAN")

  // Vocabulary word scoring (0-100 total)
  masteryScore: number; // Aggregate score from all exercises
  exerciseScores: Record<VocabularyExerciseType, number>;

  // Essential learning metrics
  totalAttempts: number;
  correctAttempts: number;
  lastSeen: string;
}

// Type definitions for vocabulary-based scoring
export type VocabularyExerciseType = "writing" | "reading" | "pairing";

// Legacy compatibility - can be removed in future
export interface LegacyVocabularyResult {
  vocabularyId: string;
  kanji: string;
  isCorrect: boolean;
}

// Constants for score calculation
export const VOCABULARY_EXERCISE_TYPES: VocabularyExerciseType[] = [
  "writing",
  "reading",
  "pairing",
];
export const VOCABULARY_MAX_SCORE = 100;

// Default implementations for vocabulary mastery
export const DEFAULT_VOCABULARY_MASTERY: Omit<
  VocabularyMasteryLevel,
  "vocabularyId" | "kanji" | "hiragana" | "romaji" | "level" | "categoryId"
> = {
  masteryScore: 0,
  exerciseScores: {
    writing: 0,
    reading: 0,
    pairing: 0,
  } as Record<VocabularyExerciseType, number>,
  totalAttempts: 0,
  correctAttempts: 0,
  lastSeen: new Date().toISOString(),
};
