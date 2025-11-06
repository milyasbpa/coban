import { create } from "zustand";
import { KanjiStorageManager } from "../storage/kanji-storage";
import { KanjiScoreCalculator } from "../utils/score-calculator";
import { KanjiStorageInitializer } from "../storage/kanji-initializer";
import {
  KanjiUserScore,
  KanjiWordLevel,
  KanjiMasteryLevel,
  KanjiExerciseResult,
} from "../model/score";

// Simplified state untuk kanji store
interface KanjiScoreState {
  // State
  currentUserScore: KanjiUserScore | null;
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
    results: KanjiExerciseResult[]
  ) => Promise<void>;

  // Getters (untuk UI compatibility)
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

  // Utility
  refreshUserScore: () => Promise<void>;
  clearAllData: () => Promise<void>;
  resetStatistics: () => Promise<void>;
}

export const useKanjiScoreStore = create<KanjiScoreState>((set, get) => ({
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
      const initResult = await KanjiStorageInitializer.initialize();
      
      if (!initResult.success) {
        throw new Error(initResult.message);
      }

      // Try to get existing user score
      let userScore = await KanjiStorageManager.getKanjiScore(userId);

      // Create default if doesn't exist
      if (!userScore) {
        userScore = await KanjiStorageManager.createDefaultKanjiScore(userId, level);
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
      console.error("KanjiScoreStore: Failed to initialize user", error);
    }
  },

  // Update kanji mastery using exercise results
  updateKanjiMastery: async (
    kanjiId: string,
    character: string,
    results: KanjiExerciseResult[]
  ) => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      // Use new storage method to handle exercise results
      await KanjiStorageManager.saveExerciseResults(currentUserScore.userId, results);
      
      // Refresh the user score to get updated data
      const refreshedScore = await KanjiStorageManager.getKanjiScore(currentUserScore.userId);
      if (refreshedScore) {
        set({ currentUserScore: refreshedScore });
      }
    } catch (error) {
      console.error("KanjiScoreStore: Failed to update kanji mastery", error);
    }
  },

  // Get lesson progress (simplified)
  getLessonProgress: (lessonId: string): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;

    // Simple calculation - can be enhanced later
    const kanjiArray = Object.values(currentUserScore.kanjiMastery);
    if (kanjiArray.length === 0) return 0;

    const totalProgress = kanjiArray.reduce((sum, kanji) => {
      return sum + (kanji.overallScore / 100) * 100;
    }, 0);

    return Math.round(totalProgress / kanjiArray.length);
  },

  // Get exercise progress (simplified)
  getExerciseProgress: (
    exerciseType: "writing" | "reading" | "pairing",
    lessonId?: string
  ): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;

    let totalProgress = 0;
    let totalWords = 0;

    Object.values(currentUserScore.kanjiMastery).forEach(kanji => {
      Object.values(kanji.words).forEach(word => {
        const maxScore = KanjiScoreCalculator.calculateMaxScorePerExercise(
          Object.values(kanji.words).length
        );
        const exerciseScore = word.exerciseScores[exerciseType];
        totalProgress += (exerciseScore / maxScore) * 100;
        totalWords++;
      });
    });

    return totalWords > 0 ? Math.round(totalProgress / totalWords) : 0;
  },

  // Get overall progress
  getOverallProgress: (): {
    currentLevel: string;
    totalKanjiLearned: number;
    masteredKanji: number;
  } | null => {
    const { currentUserScore } = get();
    if (!currentUserScore) return null;

    const kanjiArray = Object.values(currentUserScore.kanjiMastery);
    const masteredKanji = kanjiArray.filter(kanji => 
      (kanji.overallScore / 100) >= 0.9
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
      const refreshedScore = await KanjiStorageManager.getKanjiScore(currentUserScore.userId);
      if (refreshedScore) {
        set({ currentUserScore: refreshedScore });
      }
    } catch (error) {
      console.error("KanjiScoreStore: Failed to refresh user score", error);
      set({ error: "Failed to refresh user score" });
    }
  },

  // Clear all data
  clearAllData: async () => {
    try {
      await KanjiStorageManager.clearAllData();
      set({
        currentUserScore: null,
        isInitialized: false,
        error: null,
      });
    } catch (error) {
      console.error("KanjiScoreStore: Failed to clear all data", error);
      set({ error: "Failed to clear all data" });
    }
  },

  // Reset statistics (for development)
  resetStatistics: async () => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      await KanjiStorageManager.clearKanjiData(currentUserScore.userId);
      
      // Reinitialize with fresh data
      const freshScore = await KanjiStorageManager.createDefaultKanjiScore(
        currentUserScore.userId,
        currentUserScore.level
      );
      
      set({ currentUserScore: freshScore });
    } catch (error) {
      console.error("KanjiScoreStore: Failed to reset statistics", error);
      set({ error: "Failed to reset statistics" });
    }
  },
}));