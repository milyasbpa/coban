import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Grammar Score Store - Manages user progress for grammar patterns
 * Tracks completed examples per pattern and calculates progress percentages
 */

interface PatternProgress {
  patternId: string;
  completedExamples: Set<number>; // Example IDs that have been completed
  lastPracticed: Date;
}

interface LevelProgress {
  [patternId: string]: PatternProgress;
}

interface GrammarScoreState {
  // State
  progress: {
    [level: string]: LevelProgress;
  };
  userId: string | null;
  isInitialized: boolean;

  // Actions
  initializeUser: (userId: string, level: string) => void;
  markExampleComplete: (
    patternId: string,
    exampleId: number,
    level: string
  ) => void;
  getPatternProgress: (patternId: string, level: string) => number;
  getCompletedExamplesCount: (patternId: string, level: string) => number;
  getAllPatternsProgress: (level: string) => number;
  resetPatternProgress: (patternId: string, level: string) => void;
  resetAllProgress: (level: string) => void;
}

export const useGrammarScoreStore = create<GrammarScoreState>()(
  persist(
    (set, get) => ({
      progress: {},
      userId: null,
      isInitialized: false,

      initializeUser: (userId, level) => {
        set({
          userId,
          isInitialized: true,
          progress: get().progress || {},
        });
      },

      markExampleComplete: (patternId, exampleId, level) => {
        set((state) => {
          const levelProgress = state.progress[level] || {};
          const patternProgress = levelProgress[patternId] || {
            patternId,
            completedExamples: new Set<number>(),
            lastPracticed: new Date(),
          };

          // Add example to completed set
          const updatedCompletedExamples = new Set(
            patternProgress.completedExamples
          );
          updatedCompletedExamples.add(exampleId);

          return {
            progress: {
              ...state.progress,
              [level]: {
                ...levelProgress,
                [patternId]: {
                  ...patternProgress,
                  completedExamples: updatedCompletedExamples,
                  lastPracticed: new Date(),
                },
              },
            },
          };
        });
      },

      getPatternProgress: (patternId, level) => {
        const state = get();
        const patternProgress = state.progress[level]?.[patternId];

        if (!patternProgress) return 0;

        // Import GrammarService to get total examples
        const { GrammarService } = require("@/pwa/core/services/grammar");
        const totalExamples = GrammarService.getTotalExamplesForPattern(
          parseInt(patternId),
          level
        );

        if (totalExamples === 0) return 0;

        const completedCount = patternProgress.completedExamples.size;
        return Math.round((completedCount / totalExamples) * 100);
      },

      getCompletedExamplesCount: (patternId, level) => {
        const state = get();
        const patternProgress = state.progress[level]?.[patternId];
        return patternProgress?.completedExamples.size || 0;
      },

      getAllPatternsProgress: (level) => {
        const state = get();
        const levelProgress = state.progress[level];

        if (!levelProgress) return 0;

        const { GrammarService } = require("@/pwa/core/services/grammar");
        const allPatterns = GrammarService.getAllPatternsByLevel(level);

        if (allPatterns.length === 0) return 0;

        let totalExamples = 0;
        let completedExamples = 0;

        allPatterns.forEach((pattern: any) => {
          const patternId = pattern.id.toString();
          const exampleCount = pattern.examples?.length || 0;
          totalExamples += exampleCount;

          const patternProgress = levelProgress[patternId];
          if (patternProgress) {
            completedExamples += patternProgress.completedExamples.size;
          }
        });

        if (totalExamples === 0) return 0;

        return Math.round((completedExamples / totalExamples) * 100);
      },

      resetPatternProgress: (patternId, level) => {
        set((state) => {
          const levelProgress = { ...state.progress[level] };
          delete levelProgress[patternId];

          return {
            progress: {
              ...state.progress,
              [level]: levelProgress,
            },
          };
        });
      },

      resetAllProgress: (level) => {
        set((state) => {
          const newProgress = { ...state.progress };
          delete newProgress[level];

          return {
            progress: newProgress,
          };
        });
      },
    }),
    {
      name: "grammar-score-storage",
      // Convert Sets to Arrays before storing
      partialize: (state) => ({
        progress: Object.fromEntries(
          Object.entries(state.progress).map(([level, levelProgress]) => [
            level,
            Object.fromEntries(
              Object.entries(levelProgress).map(([patternId, progress]) => [
                patternId,
                {
                  ...progress,
                  completedExamples: Array.from(progress.completedExamples),
                },
              ])
            ),
          ])
        ),
      }),
    }
  )
);
