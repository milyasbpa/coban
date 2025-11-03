import { 
  ExerciseAttempt, 
  QuestionResult, 
  KanjiMasteryLevel, 
  UserScore,
  LessonScore,
  ExerciseTypeScore,
  DailyProgress,
  WeeklyProgress,
  OverallProgress
} from '../model/score';

export class ScoreCalculator {
  // ============ Exercise Scoring ============
  
  /**
   * Calculate exercise score based on accuracy, speed, and difficulty
   */
  static calculateExerciseScore(attempt: ExerciseAttempt): number {
    const accuracy = attempt.accuracy;
    const timePerQuestion = attempt.duration / attempt.totalQuestions;
    const difficultyMultiplier = this.calculateDifficultyMultiplier(attempt.answers);
    
    // Base score from accuracy (0-700 points)
    const accuracyScore = accuracy * 7;
    
    // Speed bonus (0-200 points) - faster = better, but cap at reasonable time
    const idealTimePerQuestion = 10; // 10 seconds per question is ideal
    const speedBonus = Math.max(0, Math.min(200, (idealTimePerQuestion / Math.max(timePerQuestion, 5)) * 200));
    
    // Difficulty bonus (0-100 points)
    const difficultyBonus = difficultyMultiplier * 100;
    
    const totalScore = Math.round(accuracyScore + speedBonus + difficultyBonus);
    return Math.min(1000, Math.max(0, totalScore)); // Cap between 0-1000
  }
  
  /**
   * Calculate difficulty multiplier based on question difficulty distribution
   */
  private static calculateDifficultyMultiplier(answers: QuestionResult[]): number {
    if (answers.length === 0) return 0;
    
    const difficultyScores = {
      easy: 0.5,
      medium: 1.0,
      hard: 1.5
    };
    
    const totalDifficultyScore = answers.reduce((sum, answer) => {
      return sum + difficultyScores[answer.difficulty];
    }, 0);
    
    return totalDifficultyScore / answers.length;
  }
  
  // ============ Kanji Mastery Calculation ============
  
  /**
   * Calculate kanji mastery level using spaced repetition principles
   */
  static calculateKanjiMastery(
    kanjiId: string, 
    character: string,
    level: string,
    recentResults: QuestionResult[],
    currentMastery?: KanjiMasteryLevel
  ): KanjiMasteryLevel {
    const now = new Date().toISOString();
    
    // Initialize or get current mastery data
    const totalSeen = (currentMastery?.totalSeen || 0) + recentResults.length;
    const previousCorrect = currentMastery?.totalCorrect || 0;
    const newCorrect = recentResults.filter(r => r.isCorrect).length;
    const totalCorrect = previousCorrect + newCorrect;
    
    // Calculate consecutive correct streak
    let consecutiveCorrect = currentMastery?.consecutiveCorrect || 0;
    for (let i = recentResults.length - 1; i >= 0; i--) {
      if (recentResults[i].isCorrect) {
        consecutiveCorrect++;
      } else {
        consecutiveCorrect = 0;
        break;
      }
    }
    
    // Calculate confidence score (0-100)
    const overallAccuracy = totalSeen > 0 ? (totalCorrect / totalSeen) * 100 : 0;
    const recentAccuracy = recentResults.length > 0 ? 
      (recentResults.filter(r => r.isCorrect).length / recentResults.length) * 100 : 0;
    
    // Weight recent performance more heavily
    const confidenceScore = Math.round(
      (overallAccuracy * 0.3) + (recentAccuracy * 0.7)
    );
    
    // Calculate exercise-specific mastery
    const exerciseResults = this.groupResultsByExerciseType(recentResults);
    const writingMastery = this.calculateExerciseMastery(exerciseResults.writing, currentMastery?.writingMastery);
    const readingMastery = this.calculateExerciseMastery(exerciseResults.reading, currentMastery?.readingMastery);
    const pairingMastery = this.calculateExerciseMastery(exerciseResults.pairing, currentMastery?.pairingMastery);
    
    // Determine mastery level
    const masteryLevel = this.determineMasteryLevel(confidenceScore, consecutiveCorrect, totalSeen);
    
    // Calculate adaptive difficulty
    const adaptiveDifficulty = this.calculateAdaptiveDifficulty(recentResults, confidenceScore);
    
    // Calculate next review date using spaced repetition
    const nextReviewDate = this.calculateNextReviewDate(masteryLevel, consecutiveCorrect, recentResults);
    
    return {
      kanjiId,
      character,
      level,
      masteryLevel,
      confidenceScore,
      writingMastery,
      readingMastery,
      pairingMastery,
      totalSeen,
      totalCorrect,
      consecutiveCorrect,
      lastSeen: now,
      adaptiveDifficulty,
      nextReviewDate
    };
  }
  
  private static groupResultsByExerciseType(results: QuestionResult[]) {
    // Since QuestionResult doesn't have exercise type, we'll need to infer or modify the interface
    // For now, distribute evenly across exercise types
    const third = Math.ceil(results.length / 3);
    return {
      writing: results.slice(0, third),
      reading: results.slice(third, third * 2),
      pairing: results.slice(third * 2)
    };
  }
  
  private static calculateExerciseMastery(results: QuestionResult[], currentMastery: number = 0): number {
    if (results.length === 0) return currentMastery;
    
    const accuracy = results.filter(r => r.isCorrect).length / results.length;
    const newMastery = accuracy * 100;
    
    // Weighted average with current mastery (favor recent performance)
    return Math.round((currentMastery * 0.3) + (newMastery * 0.7));
  }
  
  private static determineMasteryLevel(
    confidenceScore: number, 
    consecutiveCorrect: number,
    totalSeen: number
  ): "beginner" | "intermediate" | "advanced" | "master" {
    if (confidenceScore >= 90 && consecutiveCorrect >= 5 && totalSeen >= 10) {
      return "master";
    } else if (confidenceScore >= 75 && consecutiveCorrect >= 3 && totalSeen >= 5) {
      return "advanced";
    } else if (confidenceScore >= 60 && totalSeen >= 3) {
      return "intermediate";
    } else {
      return "beginner";
    }
  }
  
  private static calculateAdaptiveDifficulty(
    recentResults: QuestionResult[],
    confidenceScore: number
  ): "easy" | "medium" | "hard" {
    if (confidenceScore >= 80) {
      return "hard";
    } else if (confidenceScore >= 60) {
      return "medium";
    } else {
      return "easy";
    }
  }
  
  private static calculateNextReviewDate(
    masteryLevel: "beginner" | "intermediate" | "advanced" | "master",
    consecutiveCorrect: number,
    recentResults: QuestionResult[]
  ): string {
    const now = new Date();
    const intervals = {
      beginner: [1, 3, 7], // 1 day, 3 days, 1 week
      intermediate: [3, 7, 14], // 3 days, 1 week, 2 weeks
      advanced: [7, 14, 30], // 1 week, 2 weeks, 1 month
      master: [14, 30, 90] // 2 weeks, 1 month, 3 months
    };
    
    const levelIntervals = intervals[masteryLevel];
    const intervalIndex = Math.min(consecutiveCorrect, levelIntervals.length - 1);
    const daysToAdd = levelIntervals[intervalIndex];
    
    // Add some randomness to avoid cramming
    const randomDays = Math.floor(Math.random() * 2); // 0-1 additional days
    
    now.setDate(now.getDate() + daysToAdd + randomDays);
    return now.toISOString();
  }
  
  // ============ Progress Calculations ============
  
  /**
   * Update exercise type score with new attempt
   */
  static updateExerciseTypeScore(
    currentScore: ExerciseTypeScore,
    newAttempt: ExerciseAttempt
  ): ExerciseTypeScore {
    const recentAttempts = [...currentScore.recentAttempts, newAttempt]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10); // Keep last 10 attempts
    
    const totalAttempts = currentScore.totalAttempts + 1;
    const bestScore = Math.max(currentScore.bestScore, newAttempt.score);
    const totalCorrect = currentScore.totalCorrect + newAttempt.correctAnswers;
    const totalQuestions = currentScore.totalQuestions + newAttempt.totalQuestions;
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    
    // Calculate average score
    const totalScoreSum = currentScore.averageScore * (totalAttempts - 1) + newAttempt.score;
    const averageScore = totalScoreSum / totalAttempts;
    
    // Calculate average time per question
    const currentTotalTime = currentScore.averageTimePerQuestion * currentScore.totalQuestions;
    const newTotalTime = currentTotalTime + newAttempt.duration;
    const averageTimePerQuestion = totalQuestions > 0 ? newTotalTime / totalQuestions : 0;
    
    // Calculate progress trend
    const progressTrend = this.calculateProgressTrend(recentAttempts);
    
    return {
      totalAttempts,
      bestScore,
      averageScore,
      totalCorrect,
      totalQuestions,
      overallAccuracy,
      averageTimePerQuestion,
      recentAttempts,
      progressTrend
    };
  }
  
  private static calculateProgressTrend(recentAttempts: ExerciseAttempt[]): "improving" | "stable" | "declining" {
    if (recentAttempts.length < 3) return "stable";
    
    const scores = recentAttempts.slice(0, 5).map(a => a.score).reverse(); // Most recent first, then reverse for chronological order
    
    let improvements = 0;
    let declines = 0;
    
    for (let i = 1; i < scores.length; i++) {
      const diff = scores[i] - scores[i - 1];
      if (diff > 50) improvements++;
      else if (diff < -50) declines++;
    }
    
    if (improvements > declines) return "improving";
    else if (declines > improvements) return "declining";
    else return "stable";
  }
  
  /**
   * Calculate lesson progress percentage
   */
  static calculateLessonProgress(lessonScore: LessonScore): number {
    const exerciseWeights = { writing: 0.4, reading: 0.4, pairing: 0.2 };
    let totalWeight = 0;
    let weightedProgress = 0;
    
    Object.entries(exerciseWeights).forEach(([exerciseType, weight]) => {
      const attempts = lessonScore.exercises[exerciseType as keyof typeof lessonScore.exercises];
      if (attempts && attempts.length > 0) {
        totalWeight += weight;
        const bestAttempt = attempts.reduce((best, current) => 
          current.score > best.score ? current : best
        );
        weightedProgress += (bestAttempt.accuracy * weight);
      }
    });
    
    return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
  }
  
  /**
   * Calculate overall user progress
   */
  static calculateOverallProgress(userScore: UserScore): OverallProgress {
    const levelOrder = ["N5", "N4", "N3", "N2", "N1"];
    const currentLevelIndex = levelOrder.indexOf(userScore.level);
    const nextLevel = currentLevelIndex < levelOrder.length - 1 ? levelOrder[currentLevelIndex + 1] : null;
    
    // Calculate progress to next level based on completed lessons and mastery
    const totalLessons = Object.keys(userScore.lessonProgress).length;
    const completedLessons = Object.values(userScore.lessonProgress)
      .filter(lesson => lesson.status === "completed" || lesson.status === "mastered").length;
    
    const masteredKanji = Object.values(userScore.kanjiMastery)
      .filter(kanji => kanji.masteryLevel === "master").length;
    
    const progressToNextLevel = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    return {
      currentLevel: userScore.level,
      nextLevel,
      progressToNextLevel,
      totalKanjiLearned: Object.keys(userScore.kanjiMastery).length,
      masteredKanji,
      streakInfo: {
        current: userScore.overallStats.currentStreak,
        longest: userScore.overallStats.longestStreak,
        lastStudyDate: userScore.overallStats.lastStudyDate
      }
    };
  }
  
  /**
   * Update study streak
   */
  static updateStudyStreak(lastStudyDate: string): { currentStreak: number; longestStreak: number } {
    const today = new Date();
    const lastStudy = new Date(lastStudyDate);
    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      return { currentStreak: 1, longestStreak: 1 }; // This will be properly calculated in the store
    } else if (daysDiff === 0) {
      // Same day
      return { currentStreak: 0, longestStreak: 0 }; // No streak change
    } else {
      // Streak broken
      return { currentStreak: 1, longestStreak: 0 }; // Start new streak
    }
  }
}