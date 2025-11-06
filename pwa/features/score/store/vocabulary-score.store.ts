import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface VocabularyProgress {
  categoryId: string;
  categoryName: string;
  level: string;
  completedWords: number;
  totalWords: number;
  lastSeen: string;
  progressPercentage: number;
}

export interface VocabularyScoreState {
  // User progress data
  userId: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  categoryProgress: Record<string, VocabularyProgress>;
  
  // Actions
  initializeUser: (userId: string, level?: "N5" | "N4" | "N3" | "N2" | "N1") => void;
  updateCategoryProgress: (categoryId: string, categoryName: string, completedWords: number, totalWords: number) => void;
  getCategoryProgress: (categoryId: string) => number;
  getOverallProgress: () => number;
  resetProgress: () => void;
}

/**
 * Vocabulary Score Store - Simplified progress tracking for vocabulary learning
 * Currently tracks basic progress, can be expanded later for detailed scoring
 */
export const useVocabularyScoreStore = create<VocabularyScoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: 'default',
      level: 'N5',
      categoryProgress: {},

      // Initialize user with default data
      initializeUser: (userId: string, level: "N5" | "N4" | "N3" | "N2" | "N1" = 'N5') => {
        set({
          userId,
          level,
          categoryProgress: {},
        });
      },

      // Update progress for a specific category
      updateCategoryProgress: (categoryId: string, categoryName: string, completedWords: number, totalWords: number) => {
        const progressPercentage = totalWords > 0 ? Math.round((completedWords / totalWords) * 100) : 0;
        
        set((state) => ({
          categoryProgress: {
            ...state.categoryProgress,
            [categoryId]: {
              categoryId,
              categoryName,
              level: state.level,
              completedWords,
              totalWords,
              lastSeen: new Date().toISOString(),
              progressPercentage,
            },
          },
        }));
      },

      // Get progress percentage for a specific category
      getCategoryProgress: (categoryId: string): number => {
        const progress = get().categoryProgress[categoryId];
        return progress ? progress.progressPercentage : 0;
      },

      // Get overall progress across all categories
      getOverallProgress: (): number => {
        const { categoryProgress } = get();
        const progressValues = Object.values(categoryProgress);
        
        if (progressValues.length === 0) return 0;
        
        const totalProgress = progressValues.reduce((sum, progress) => sum + progress.progressPercentage, 0);
        return Math.round(totalProgress / progressValues.length);
      },

      // Reset all progress
      resetProgress: () => {
        set((state) => ({
          categoryProgress: {},
        }));
      },
    }),
    {
      name: 'vocabulary-score-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);