import { create } from "zustand";
import { KanjiFirestoreManager } from "../storage/kanji-firestore";
import { KanjiScoreCalculator } from "../utils/score-calculator";
import {
  KanjiUserScore,
  KanjiWordLevel,
  KanjiMasteryLevel,
  KanjiExerciseResult,
  ExerciseType,
} from "../model/kanji-score";
import { KanjiService } from "@/pwa/core/services/kanji";

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
  getLessonProgress: (lessonId: string, level: string) => number;
  getExerciseProgress: (
    exerciseType: "writing" | "reading" | "pairing",
    lessonId: string,
    level: string
  ) => number;
  getOverallProgress: () => {
    currentLevel: string;
    totalKanjiLearned: number;
    masteredKanji: number;
  } | null;
  getKanjiMastery: (kanjiId: string) => KanjiMasteryLevel | null;
  getKanjiAccuracy: (kanjiId: string) => number | null;

  // Utility
  refreshUserScore: () => Promise<void>;
  clearAllData: () => Promise<void>;
  resetStatistics: () => Promise<void>;
}

// Helper functions for topic-aware scoring calculations
const getTotalWordsInTopic = (topicId: string, level: string): number => {
  const categories = KanjiService.getTopicCategories(level);
  const category = categories[topicId];
  if (!category) return 0;

  let totalWords = 0;
  category.kanji_ids.forEach((kanjiId) => {
    const kanji = KanjiService.getKanjiById(kanjiId, level);
    if (kanji?.examples) {
      totalWords += kanji.examples.length;
    }
  });
  return totalWords;
};

const getTotalWordsInLesson = (lessonId: number, level: string): number => {
  const kanjiList = KanjiService.getKanjiDetailsByLessonId(lessonId, level);
  let totalWords = 0;
  kanjiList.forEach((kanji) => {
    if (kanji.examples) {
      totalWords += kanji.examples.length;
    }
  });
  return totalWords;
};

const getCorrectWordsInScope = (
  currentUserScore: KanjiUserScore,
  lessonId: string,
  level: string,
  exerciseType?: ExerciseType
): number => {
  let correctWords = 0;

  // Determine scope - get kanji IDs that belong to this lesson/topic
  let scopeKanjiIds: string[] = [];

  if (lessonId.startsWith("topic_")) {
    const topicId = lessonId.replace("topic_", "");
    const categories = KanjiService.getTopicCategories(level);
    const category = categories[topicId];
    if (category) {
      scopeKanjiIds = category.kanji_ids.map((id) => id.toString());
    }
  } else {
    const numericLessonId = parseInt(lessonId);
    const kanjiList = KanjiService.getKanjiDetailsByLessonId(
      numericLessonId,
      level
    );
    scopeKanjiIds = kanjiList.map((kanji) => kanji.id.toString());
  }

  // Count correct words in scope
  scopeKanjiIds.forEach((kanjiId) => {
    const kanjiMastery = currentUserScore.kanjiMastery[kanjiId];
    if (kanjiMastery) {
      Object.values(kanjiMastery.words).forEach((word) => {
        if (exerciseType) {
          // Count for specific exercise type
          if (word.exerciseScores[exerciseType] > 0) {
            correctWords++;
          }
        } else {
          // Count for all exercise types (for topic progress)
          const exerciseTypes: ExerciseType[] = [
            "writing",
            "reading",
            "pairing",
          ];
          exerciseTypes.forEach((exType) => {
            if (word.exerciseScores[exType] > 0) {
              correctWords++;
            }
          });
        }
      });
    }
  });

  return correctWords;
};

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
      // Try to get existing user score from Firestore
      let userScore = await KanjiFirestoreManager.getKanjiScore(userId);

      // Create default if doesn't exist
      if (!userScore) {
        userScore = await KanjiFirestoreManager.createDefaultKanjiScore(
          userId,
          level
        );
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
      await KanjiFirestoreManager.saveExerciseResults(
        currentUserScore.userId,
        results
      );

      // Refresh the user score to get updated data
      const refreshedScore = await KanjiFirestoreManager.getKanjiScore(
        currentUserScore.userId
      );
      if (refreshedScore) {
        set({ currentUserScore: refreshedScore });
      }
    } catch (error) {
      console.error("KanjiScoreStore: Failed to update kanji mastery", error);
    }
  },

  // Get lesson progress (topic-aware)
  getLessonProgress: (lessonId: string, level: string): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;

    // Calculate total words in scope (topic or lesson)
    let totalWords = 0;
    if (lessonId.startsWith("topic_")) {
      const topicId = lessonId.replace("topic_", "");
      totalWords = getTotalWordsInTopic(topicId, level);
    } else {
      const numericLessonId = parseInt(lessonId);
      totalWords = getTotalWordsInLesson(numericLessonId, level);
    }

    if (totalWords === 0) return 0;

    // Calculate total correct words from all exercise types
    const totalCorrectWords = getCorrectWordsInScope(
      currentUserScore,
      lessonId,
      level
    );
    const totalPossibleWords = totalWords * 3; // 3 exercise types (writing, reading, pairing)

    return Math.round((totalCorrectWords / totalPossibleWords) * 100 * 10) / 10;
  },

  // Get exercise progress (topic-aware)
  getExerciseProgress: (
    exerciseType: "writing" | "reading" | "pairing",
    lessonId: string,
    level: string
  ): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;

    // Calculate total words in scope (topic or lesson)
    let totalWords = 0;
    if (lessonId.startsWith("topic_")) {
      const topicId = lessonId.replace("topic_", "");
      totalWords = getTotalWordsInTopic(topicId, level);
    } else {
      const numericLessonId = parseInt(lessonId);
      totalWords = getTotalWordsInLesson(numericLessonId, level);
    }

    if (totalWords === 0) return 0;

    // Calculate correct words for specific exercise type
    const correctWords = getCorrectWordsInScope(
      currentUserScore,
      lessonId,
      level,
      exerciseType
    );

    return Math.round((correctWords / totalWords) * 100 * 10) / 10;
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
    const masteredKanji = kanjiArray.filter(
      (kanji) => kanji.overallScore / 100 >= 0.9
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

  // Get kanji accuracy percentage (for color coding in UI)
  getKanjiAccuracy: (kanjiId: string): number | null => {
    const { currentUserScore } = get();
    if (!currentUserScore) return null;

    const kanjiMastery = currentUserScore.kanjiMastery[kanjiId];
    if (!kanjiMastery) return null;

    // Calculate total attempts and correct attempts across all words
    const words = Object.values(kanjiMastery.words);
    if (words.length === 0) return null;

    const totalAttempts = words.reduce((sum, word) => sum + word.totalAttempts, 0);
    const correctAttempts = words.reduce((sum, word) => sum + word.correctAttempts, 0);

    if (totalAttempts === 0) return null;

    return Math.round((correctAttempts / totalAttempts) * 100);
  },

  // Refresh user score from storage
  refreshUserScore: async () => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      const refreshedScore = await KanjiFirestoreManager.getKanjiScore(
        currentUserScore.userId
      );
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
      await KanjiFirestoreManager.clearAllData();
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
      await KanjiFirestoreManager.clearKanjiData(currentUserScore.userId);

      // Reinitialize with fresh data
      const freshScore = await KanjiFirestoreManager.createDefaultKanjiScore(
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
