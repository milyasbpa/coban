import { create } from 'zustand';
import { StorageManager } from '../lib/storage';
import { ScoreCalculator } from '../lib/score-calculator';
import { 
  UserScore, 
  ExerciseAttempt, 
  LessonScore,
  KanjiMasteryLevel,
  OverallProgress,
  QuestionResult
} from '../model/score';

interface ScoreState {
  // State
  currentUserScore: UserScore | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initializeUser: (userId: string, level?: "N5" | "N4" | "N3" | "N2" | "N1") => Promise<void>;
  updateExerciseScore: (attempt: ExerciseAttempt) => Promise<void>;
  updateKanjiMastery: (kanjiId: string, character: string, results: QuestionResult[]) => Promise<void>;
  
  // Getters
  getLessonProgress: (lessonId: string) => number;
  getExerciseProgress: (exerciseType: "writing" | "reading" | "pairing", lessonId?: string) => number;
  getOverallProgress: () => OverallProgress | null;
  getKanjiMastery: (kanjiId: string) => KanjiMasteryLevel | null;
  
  // Utility
  refreshUserScore: () => Promise<void>;
  clearAllData: () => Promise<void>;
  resetStatistics: () => Promise<void>;
}

export const useScoreStore = create<ScoreState>((set, get) => ({
  // Initial state
  currentUserScore: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  
  // Initialize user score
  initializeUser: async (userId: string, level: "N5" | "N4" | "N3" | "N2" | "N1" = "N5") => {
    set({ isLoading: true, error: null });
    
    try {
      // Validate storage first
      const isStorageValid = await StorageManager.validateStorage();
      if (!isStorageValid) {
        throw new Error('Storage validation failed');
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
        error: null
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user';
      set({ 
        error: errorMessage, 
        isLoading: false, 
        isInitialized: false 
      });
      console.error('ScoreStore: Failed to initialize user', error);
    }
  },
  
  // Update exercise score
  updateExerciseScore: async (attempt: ExerciseAttempt) => {
    const { currentUserScore } = get();
    if (!currentUserScore) {
      console.warn('ScoreStore: No user score available for update');
      return;
    }
    
    try {
      set({ isLoading: true });
      
      // Calculate exercise score
      const calculatedScore = ScoreCalculator.calculateExerciseScore(attempt);
      const updatedAttempt = { ...attempt, score: calculatedScore };
      
      // Update exercise type score
      const currentExerciseScore = currentUserScore.exerciseScores[attempt.exerciseType];
      const updatedExerciseScore = ScoreCalculator.updateExerciseTypeScore(currentExerciseScore, updatedAttempt);
      
      // Update lesson progress
      const currentLessonScore = currentUserScore.lessonProgress[attempt.lessonId] || {
        lessonId: attempt.lessonId,
        level: attempt.level,
        category: "kanji",
        totalScore: 0,
        maxPossibleScore: 1000,
        completionPercentage: 0,
        exercises: { writing: [], reading: [], pairing: [] },
        firstAttempt: updatedAttempt.startTime,
        lastAttempt: updatedAttempt.endTime,
        status: "not_started" as const
      };
      
      // Add attempt to lesson exercises
      const exerciseAttempts = currentLessonScore.exercises[attempt.exerciseType] || [];
      exerciseAttempts.push(updatedAttempt);
      
      // Update lesson score
      const updatedLessonScore: LessonScore = {
        ...currentLessonScore,
        exercises: {
          ...currentLessonScore.exercises,
          [attempt.exerciseType]: exerciseAttempts
        },
        totalScore: Math.max(currentLessonScore.totalScore, calculatedScore),
        lastAttempt: updatedAttempt.endTime,
        bestAttempt: !currentLessonScore.bestAttempt || calculatedScore > currentLessonScore.bestAttempt.score 
          ? updatedAttempt 
          : currentLessonScore.bestAttempt,
        status: calculatedScore >= 800 ? "completed" : "in_progress",
        completionPercentage: ScoreCalculator.calculateLessonProgress({
          ...currentLessonScore,
          exercises: {
            ...currentLessonScore.exercises,
            [attempt.exerciseType]: exerciseAttempts
          }
        })
      };
      
      // Update overall stats
      const updatedOverallStats = {
        ...currentUserScore.overallStats,
        totalScore: currentUserScore.overallStats.totalScore + calculatedScore,
        totalExercisesCompleted: currentUserScore.overallStats.totalExercisesCompleted + 1,
        studyTimeMinutes: currentUserScore.overallStats.studyTimeMinutes + Math.round(attempt.duration / 60),
        lastStudyDate: new Date().toISOString()
      };
      
      // Calculate new average accuracy
      const totalQuestions = currentUserScore.overallStats.totalExercisesCompleted * 10; // Estimate
      const totalCorrect = (currentUserScore.overallStats.averageAccuracy / 100) * totalQuestions + attempt.correctAnswers;
      updatedOverallStats.averageAccuracy = (totalCorrect / (totalQuestions + attempt.totalQuestions)) * 100;
      
      // Update study streak
      const streakUpdate = ScoreCalculator.updateStudyStreak(currentUserScore.overallStats.lastStudyDate);
      if (streakUpdate.currentStreak > 0) {
        updatedOverallStats.currentStreak = currentUserScore.overallStats.currentStreak + streakUpdate.currentStreak;
        updatedOverallStats.longestStreak = Math.max(
          updatedOverallStats.longestStreak, 
          updatedOverallStats.currentStreak
        );
      }
      
      // Create updated user score
      const updatedUserScore: UserScore = {
        ...currentUserScore,
        overallStats: updatedOverallStats,
        exerciseScores: {
          ...currentUserScore.exerciseScores,
          [attempt.exerciseType]: updatedExerciseScore
        },
        lessonProgress: {
          ...currentUserScore.lessonProgress,
          [attempt.lessonId]: updatedLessonScore
        },
        updatedAt: new Date().toISOString()
      };
      
      // Save to storage
      await StorageManager.saveUserScore(currentUserScore.userId, updatedUserScore);
      await StorageManager.saveExerciseAttempt(updatedAttempt);
      
      set({ 
        currentUserScore: updatedUserScore, 
        isLoading: false 
      });
      
    } catch (error) {
      console.error('ScoreStore: Failed to update exercise score', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update exercise score',
        isLoading: false 
      });
    }
  },
  
  // Update kanji mastery
  updateKanjiMastery: async (kanjiId: string, character: string, results: QuestionResult[]) => {
    const { currentUserScore } = get();
    if (!currentUserScore) return;
    
    try {
      const currentMastery = currentUserScore.kanjiMastery[kanjiId];
      const updatedMastery = ScoreCalculator.calculateKanjiMastery(
        kanjiId,
        character,
        currentUserScore.level,
        results,
        currentMastery
      );
      
      const updatedUserScore: UserScore = {
        ...currentUserScore,
        kanjiMastery: {
          ...currentUserScore.kanjiMastery,
          [kanjiId]: updatedMastery
        },
        updatedAt: new Date().toISOString()
      };
      
      await StorageManager.saveUserScore(currentUserScore.userId, updatedUserScore);
      set({ currentUserScore: updatedUserScore });
      
    } catch (error) {
      console.error('ScoreStore: Failed to update kanji mastery', error);
    }
  },
  
  // Get lesson progress
  getLessonProgress: (lessonId: string): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;
    
    const lessonScore = currentUserScore.lessonProgress[lessonId];
    if (!lessonScore) return 0;
    
    return lessonScore.completionPercentage;
  },
  
  // Get exercise progress
  getExerciseProgress: (exerciseType: "writing" | "reading" | "pairing", lessonId?: string): number => {
    const { currentUserScore } = get();
    if (!currentUserScore) return 0;
    
    if (lessonId) {
      const lessonScore = currentUserScore.lessonProgress[lessonId];
      if (!lessonScore) return 0;
      
      const exerciseAttempts = lessonScore.exercises[exerciseType];
      if (!exerciseAttempts || exerciseAttempts.length === 0) return 0;
      
      const bestAttempt = exerciseAttempts.reduce((best, current) => 
        current.score > best.score ? current : best
      );
      return bestAttempt.accuracy;
    }
    
    // Return overall exercise type progress
    const exerciseScore = currentUserScore.exerciseScores[exerciseType];
    return exerciseScore.overallAccuracy;
  },
  
  // Get overall progress
  getOverallProgress: (): OverallProgress | null => {
    const { currentUserScore } = get();
    if (!currentUserScore) return null;
    
    return ScoreCalculator.calculateOverallProgress(currentUserScore);
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
      const refreshedScore = await StorageManager.getUserScore(currentUserScore.userId);
      set({ 
        currentUserScore: refreshedScore, 
        isLoading: false 
      });
    } catch (error) {
      console.error('ScoreStore: Failed to refresh user score', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refresh user score',
        isLoading: false 
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
        error: null
      });
    } catch (error) {
      console.error('ScoreStore: Failed to clear all data', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to clear data',
        isLoading: false 
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
        error: null
      });
      
    } catch (error) {
      console.error('ScoreStore: Failed to reset statistics', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reset statistics',
        isLoading: false 
      });
    }
  }
}));