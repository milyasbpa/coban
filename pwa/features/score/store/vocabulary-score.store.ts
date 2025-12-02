import { create } from 'zustand';
import { VocabularyFirestoreManager } from '../storage/vocabulary-firestore';
import { VocabularyService } from '@/pwa/core/services/vocabulary';
import { VocabularyUserScore } from '../model/vocabulary-score';

export interface VocabularyScoreState {
  // State
  currentUserScore: VocabularyUserScore | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initializeUser: (userId: string, level?: "N5" | "N4" | "N3" | "N2" | "N1") => Promise<void>;
  getCategoryProgress: (categoryId: string, level: string) => number;
  getExerciseProgress: (
    exerciseType: "writing" | "reading" | "pairing",
    categoryId: string,
    level: string
  ) => number;
  getOverallProgress: () => number;
  getVocabularyAccuracy: (vocabularyId: string, level: string, categoryId: string) => number | null;
  refreshUserScore: () => Promise<void>;
  resetProgress: () => Promise<void>;
  resetCategoryStatistics: (categoryId: string, level: string) => Promise<void>;
  resetVocabularyStatistics: (vocabularyId: string, level: string, categoryId: string) => Promise<void>;
}

// Helper: Get total words in a category
const getTotalWordsInCategory = (categoryId: string, level: string): number => {
  const category = VocabularyService.getVocabularyByCategory(parseInt(categoryId), level);
  return category ? category.vocabulary.length : 0;
};

// Helper: Get correct words in category from user score
const getCorrectWordsInCategory = (
  currentUserScore: VocabularyUserScore,
  categoryId: string,
  level: string
): number => {
  let correctWords = 0;
  
  // Get all vocabulary IDs in this category
  const category = VocabularyService.getVocabularyByCategory(parseInt(categoryId), level);
  if (!category) return 0;
  
  const vocabularyIds = category.vocabulary.map(v => v.id.toString());
  
  // Access nested path: level -> categoryId -> vocabularyId
  const categoryMastery = currentUserScore.vocabularyMastery[level]?.[categoryId];
  if (!categoryMastery) return 0;
  
  // Count words that have been mastered (from all 3 exercise types)
  vocabularyIds.forEach((vocabId) => {
    const mastery = categoryMastery[vocabId];
    if (mastery) {
      // Count how many exercise types have been completed
      const exerciseTypes: ('writing' | 'reading' | 'pairing')[] = ['writing', 'reading', 'pairing'];
      exerciseTypes.forEach((type) => {
        if (mastery.exerciseScores[type] > 0) {
          correctWords++;
        }
      });
    }
  });
  
  return correctWords;
};

// Helper: Get correct words in category for specific exercise type
const getCorrectWordsInCategoryByExercise = (
  currentUserScore: VocabularyUserScore,
  categoryId: string,
  level: string,
  exerciseType: 'writing' | 'reading' | 'pairing'
): number => {
  let correctWords = 0;
  
  // Get all vocabulary IDs in this category
  const category = VocabularyService.getVocabularyByCategory(parseInt(categoryId), level);
  if (!category) return 0;
  
  const vocabularyIds = category.vocabulary.map(v => v.id.toString());
  
  // Access nested path: level -> categoryId -> vocabularyId
  const categoryMastery = currentUserScore.vocabularyMastery[level]?.[categoryId];
  if (!categoryMastery) return 0;
  
  // Count words that have been completed for this specific exercise type
  vocabularyIds.forEach((vocabId) => {
    const mastery = categoryMastery[vocabId];
    if (mastery && mastery.exerciseScores[exerciseType] > 0) {
      correctWords++;
    }
  });
  
  return correctWords;
};

/**
 * Vocabulary Score Store - Calculate progress from actual exercise results
 */
export const useVocabularyScoreStore = create<VocabularyScoreState>((set, get) => ({
  // Initial state
  currentUserScore: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Initialize user with Firestore data
  initializeUser: async (userId: string, level?: "N5" | "N4" | "N3" | "N2" | "N1") => {
    try {
      set({ isLoading: true, error: null });
      
      let userScore = await VocabularyFirestoreManager.getVocabularyScore(userId);
      
      if (!userScore) {
        userScore = await VocabularyFirestoreManager.createDefaultVocabularyScore(userId);
      }
      
      set({ 
        currentUserScore: userScore, 
        isLoading: false, 
        isInitialized: true 
      });
    } catch (error) {
      console.error('Failed to initialize vocabulary user:', error);
      set({ 
        error: 'Failed to initialize user', 
        isLoading: false 
      });
    }
  },

  // Get progress percentage for a specific category (calculated from actual results)
  getCategoryProgress: (categoryId: string, level: string): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;

    // Calculate total words in category
    const totalWords = getTotalWordsInCategory(categoryId, level);
    if (totalWords === 0) return 0;

    // Calculate total correct words from all exercise types
    const totalCorrectWords = getCorrectWordsInCategory(
      currentUserScore,
      categoryId,
      level
    );
    const totalPossibleWords = totalWords * 3; // 3 exercise types (writing, reading, pairing)

    return Math.round((totalCorrectWords / totalPossibleWords) * 100 * 10) / 10;
  },

  // Get exercise progress for specific exercise type in category
  getExerciseProgress: (
    exerciseType: "writing" | "reading" | "pairing",
    categoryId: string,
    level: string
  ): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;

    // Calculate total words in category
    const totalWords = getTotalWordsInCategory(categoryId, level);
    if (totalWords === 0) return 0;

    // Calculate correct words for specific exercise type
    const correctWords = getCorrectWordsInCategoryByExercise(
      currentUserScore,
      categoryId,
      level,
      exerciseType
    );

    return Math.round((correctWords / totalWords) * 100 * 10) / 10;
  },

  // Get overall progress across all categories
  getOverallProgress: (): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;
    
    // Iterate through nested structure: level -> categoryId -> vocabularyId
    let totalScore = 0;
    let totalVocabulary = 0;
    
    for (const level in currentUserScore.vocabularyMastery) {
      for (const categoryId in currentUserScore.vocabularyMastery[level]) {
        const categoryMastery = currentUserScore.vocabularyMastery[level][categoryId];
        for (const vocabId in categoryMastery) {
          totalScore += categoryMastery[vocabId].masteryScore;
          totalVocabulary++;
        }
      }
    }
    
    if (totalVocabulary === 0) return 0;
    
    const maxPossibleScore = totalVocabulary * 100; // 100 points per vocabulary
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  },

  // Get vocabulary accuracy percentage (for color coding in UI)
  getVocabularyAccuracy: (vocabularyId: string, level: string, categoryId: string): number | null => {
    const { currentUserScore } = get();
    if (!currentUserScore) return null;

    const vocabulary = currentUserScore.vocabularyMastery[level]?.[categoryId]?.[vocabularyId];
    if (!vocabulary) return null;

    if (vocabulary.totalAttempts === 0) return null;

    return Math.round((vocabulary.correctAttempts / vocabulary.totalAttempts) * 100);
  },

  // Refresh user score from storage
  refreshUserScore: async () => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;
    
    try {
      const updatedScore = await VocabularyFirestoreManager.getVocabularyScore(currentUserScore.userId);
      if (updatedScore) {
        set({ currentUserScore: updatedScore });
      }
    } catch (error) {
      console.error('Failed to refresh vocabulary score:', error);
    }
  },

  // Reset all progress
  resetProgress: async () => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;
    
    try {
      await VocabularyFirestoreManager.clearVocabularyData(currentUserScore.userId);
      const newScore = await VocabularyFirestoreManager.createDefaultVocabularyScore(
        currentUserScore.userId
      );
      set({ currentUserScore: newScore });
    } catch (error) {
      console.error('Failed to reset vocabulary progress:', error);
    }
  },

  // Reset statistics for specific category (by vocabulary IDs)
  // Reset statistics for specific category (by vocabulary IDs)
  resetCategoryStatistics: async (categoryId: string, level: string) => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      // Get all vocabulary IDs in this category
      const category = VocabularyService.getVocabularyByCategory(
        parseInt(categoryId),
        level
      );
      
      if (!category) return;

      const vocabularyIds = category.vocabulary.map((v) => v.id.toString());
      
      if (vocabularyIds.length > 0) {
        await VocabularyFirestoreManager.resetVocabularyByIds(
          currentUserScore.userId,
          level,
          categoryId,
          vocabularyIds
        );

        // Refresh user score to reflect changes
        await get().refreshUserScore();
      }
    } catch (error) {
      console.error('Failed to reset category statistics:', error);
    }
  },

  // Reset statistics for single vocabulary word
  resetVocabularyStatistics: async (vocabularyId: string, level: string, categoryId: string) => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;

    try {
      await VocabularyFirestoreManager.resetVocabularyByIds(
        currentUserScore.userId,
        level,
        categoryId,
        [vocabularyId] // Single ID in array
      );

      // Refresh user score to reflect changes
      await get().refreshUserScore();
    } catch (error) {
      console.error('Failed to reset vocabulary statistics:', error);
    }
  },
}));