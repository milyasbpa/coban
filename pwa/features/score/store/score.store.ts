import { create } from "zustand";
import { StorageManager } from "../storage/storage";
import { ScoreCalculator } from "../utils/score-calculator";
import { KanjiWordMapper } from "../utils/kanji-word-mapper";
import { WordIdGenerator } from "../utils/word-id-generator";
import {
  UserScore,
  WordMasteryLevel,
  KanjiMasteryLevel,
  QuestionResult,
} from "../model/score";

interface ScoreState {
  // State
  currentUserScore: UserScore | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initializeUser: (
    userId: string,
    level?: "N5" | "N4" | "N3" | "N2" | "N1"
  ) => Promise<void>;
  updateKanjiMastery: (
    kanjiId: string,
    character: string,
    results: QuestionResult[]
  ) => Promise<void>;

  // Getters (maintain same interface for UI compatibility)
  getLessonProgress: (lessonId: string) => number;
  getExerciseProgress: (
    exerciseType: "writing" | "reading" | "pairing",
    lessonId?: string
  ) => number;
  getOverallProgress: () => {
    currentLevel: string;
    totalKanjiLearned: number;
    masteredKanji: number;
  } | null;
  getKanjiMastery: (kanjiId: string) => KanjiMasteryLevel | null;

  // Word-based methods (internal use)
  getWordMastery: (kanjiId: string, wordId: string) => WordMasteryLevel | null;
  updateWordMastery: (wordId: string, result: QuestionResult) => Promise<void>;

  // Utility
  refreshUserScore: () => Promise<void>;
  clearAllData: () => Promise<void>;
  resetStatistics: () => Promise<void>;

  // Compatibility layer for existing exercise containers
  updateExerciseScore?: (attempt: any) => Promise<void>;
}

export const useScoreStore = create<ScoreState>((set, get) => ({
  // Initial state
  currentUserScore: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Initialize user score
  initializeUser: async (
    userId: string,
    level: "N5" | "N4" | "N3" | "N2" | "N1" = "N5"
  ) => {
    set({ isLoading: true, error: null });

    try {
      // Initialize storage system first
      const { StorageInitializer } = await import("../storage/initializer");
      const initResult = await StorageInitializer.initialize();
      
      if (!initResult.success) {
        throw new Error(`Storage initialization failed: ${initResult.message}`);
      }

      // Try to get existing user score
      let userScore = await StorageManager.getUserScore(userId);

      // Create default if doesn't exist
      if (!userScore) {
        userScore = await StorageManager.createDefaultUserScore(userId, level);
      }

      set({
        currentUserScore: userScore,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize user";
      set({
        error: errorMessage,
        isLoading: false,
        isInitialized: false,
      });
      console.error("ScoreStore: Failed to initialize user", error);
    }
  },



  // Update kanji mastery using word-based scoring
  updateKanjiMastery: async (
    kanjiId: string,
    character: string,
    results: QuestionResult[]
  ) => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      // Use new storage method to handle word-based updates
      await StorageManager.saveQuestionResults(currentUserScore.userId, results);
      
      // Refresh the user score to get updated data
      const refreshedScore = await StorageManager.getUserScore(currentUserScore.userId);
      if (refreshedScore) {
        set({ currentUserScore: refreshedScore });
      }
    } catch (error) {
      console.error("ScoreStore: Failed to update kanji mastery", error);
    }
  },

  // Get word mastery (internal method)
  getWordMastery: (kanjiId: string, wordId: string): WordMasteryLevel | null => {
    const { currentUserScore } = get();
    if (!currentUserScore || !currentUserScore.kanjiMastery[kanjiId]) {
      return null;
    }
    return currentUserScore.kanjiMastery[kanjiId].words[wordId] || null;
  },

  // Update individual word mastery (internal method)
  updateWordMastery: async (wordId: string, result: QuestionResult) => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      await StorageManager.saveQuestionResults(currentUserScore.userId, [result]);
      
      // Refresh user score
      const refreshedScore = await StorageManager.getUserScore(currentUserScore.userId);
      if (refreshedScore) {
        set({ currentUserScore: refreshedScore });
      }
    } catch (error) {
      console.error("ScoreStore: Failed to update word mastery", error);
    }
  },

  // Get lesson progress (UI compatibility - uses word-based data)
  getLessonProgress: (lessonId: string): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;

    // Calculate progress based on kanji mastery for this lesson
    const kanjiArray = Object.values(currentUserScore.kanjiMastery);
    if (kanjiArray.length === 0) return 0;

    // Simple average of kanji scores for lesson
    const totalProgress = kanjiArray.reduce((sum, kanji) => {
      return sum + ((kanji.overallScore / 100) * 100);
    }, 0);

    return Math.round(totalProgress / kanjiArray.length);
  },

  // Get exercise progress (UI compatibility - uses word-based data)
  getExerciseProgress: (
    exerciseType: "writing" | "reading" | "pairing",
    lessonId?: string
  ): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;

    // Calculate exercise-specific progress from word data
    const kanjiArray = Object.values(currentUserScore.kanjiMastery);
    if (kanjiArray.length === 0) return 0;

    let totalProgress = 0;
    let totalWords = 0;

    kanjiArray.forEach(kanji => {
      const words = Object.values(kanji.words);
      words.forEach(word => {
        const exerciseScore = word.exerciseScores[exerciseType];
        const maxScore = ScoreCalculator.calculateMaxScorePerExercise(
          Object.keys(kanji.words).length
        );
        totalProgress += maxScore > 0 ? (exerciseScore / maxScore) * 100 : 0;
        totalWords++;
      });
    });

    return totalWords > 0 ? Math.round(totalProgress / totalWords) : 0;
  },

  // Get overall progress (UI compatibility - uses word-based data)
  getOverallProgress: (): {
    currentLevel: string;
    totalKanjiLearned: number;
    masteredKanji: number;
  } | null => {
    const { currentUserScore } = get();
    if (!currentUserScore) return null;

    const kanjiArray = Object.values(currentUserScore.kanjiMastery);
    const masteredKanji = kanjiArray.filter(kanji => 
      (kanji.overallScore / 100) >= 0.9 // 90% mastery = mastered
    ).length;

    return {
      currentLevel: currentUserScore.level,
      totalKanjiLearned: kanjiArray.length,
      masteredKanji,
    };
  },

  // Get kanji mastery
  getKanjiMastery: (kanjiId: string): KanjiMasteryLevel | null => {
    const { currentUserScore } = get();
    if (!currentUserScore) return null;

    return currentUserScore.kanjiMastery[kanjiId] || null;
  },

  // Refresh user score from storage
  refreshUserScore: async () => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      set({ isLoading: true });
      const refreshedScore = await StorageManager.getUserScore(
        currentUserScore.userId
      );
      set({
        currentUserScore: refreshedScore,
        isLoading: false,
      });
    } catch (error) {
      console.error("ScoreStore: Failed to refresh user score", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh user score",
        isLoading: false,
      });
    }
  },

  // Clear all data
  clearAllData: async () => {
    try {
      set({ isLoading: true });
      await StorageManager.clearAllData();
      set({
        currentUserScore: null,
        isLoading: false,
        isInitialized: false,
        error: null,
      });
    } catch (error) {
      console.error("ScoreStore: Failed to clear all data", error);
      set({
        error: error instanceof Error ? error.message : "Failed to clear data",
        isLoading: false,
      });
    }
  },

  // Reset statistics (for development)
  resetStatistics: async () => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      set({ isLoading: true });

      // Clear user data and recreate default
      await StorageManager.clearUserData(currentUserScore.userId);
      const newUserScore = await StorageManager.createDefaultUserScore(
        currentUserScore.userId,
        currentUserScore.level
      );

      set({
        currentUserScore: newUserScore,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("ScoreStore: Failed to reset statistics", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to reset statistics",
        isLoading: false,
      });
    }
  },

  // Compatibility method for existing exercise containers
  updateExerciseScore: async (attempt: any) => {
    // This is a no-op method for backward compatibility
    // Exercise containers now use updateKanjiMastery with word-based results
    console.warn("ScoreStore: updateExerciseScore is deprecated. Use updateKanjiMastery with word-based results instead.");
  },
}));
