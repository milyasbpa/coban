import { 
  ExerciseAttempt, 
  QuestionResult, 
  KanjiMasteryLevel, 
  UserScore,
  LessonScore,
  ExerciseTypeScore,
  OverallProgress
} from '../model/score';

export class ScoreCalculator {
  // ============ Exercise Scoring ============
  
  /**
   * Calculate exercise score based on accuracy, speed, and difficulty
   */
  static calculateExerciseScore(attempt: ExerciseAttempt): number {
    const accuracy = (attempt.correctAnswers / attempt.totalQuestions) * 100;
    
    // Base score from accuracy (0-800 points)
    const accuracyScore = accuracy * 8;
    
    // Question count bonus (0-200 points) - more questions = better
    const questionBonus = Math.min(200, attempt.totalQuestions * 10);
    
    const totalScore = Math.round(accuracyScore + questionBonus);
    return Math.min(1000, Math.max(0, totalScore)); // Cap between 0-1000
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
    
    // Determine mastery level
    const masteryLevel = this.determineMasteryLevel(confidenceScore, consecutiveCorrect, totalSeen);
    
    return {
      kanjiId,
      character,
      level,
      masteryLevel,
      confidenceScore,
      totalSeen,
      totalCorrect,
      consecutiveCorrect,
      lastSeen: now,
    };
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
  
  // ============ Progress Calculations ============
  
  /**
   * Update exercise type score with new attempt
   */
  static updateExerciseTypeScore(
    currentScore: ExerciseTypeScore,
    newAttempt: ExerciseAttempt
  ): ExerciseTypeScore {
    const totalAttempts = currentScore.totalAttempts + 1;
    const newScore = this.calculateExerciseScore(newAttempt);
    const bestScore = Math.max(currentScore.bestScore, newScore);
    const totalCorrect = currentScore.totalCorrect + newAttempt.correctAnswers;
    const totalQuestions = currentScore.totalQuestions + newAttempt.totalQuestions;
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    
    // Calculate average score
    const totalScoreSum = currentScore.averageScore * (totalAttempts - 1) + newScore;
    const averageScore = totalScoreSum / totalAttempts;
    
    return {
      totalAttempts,
      bestScore,
      averageScore,
      totalCorrect,
      totalQuestions,
      overallAccuracy,
    };
  }
  
  /**
   * Calculate lesson progress percentage
   */
  static calculateLessonProgress(lessonScore: LessonScore): number {
    const exerciseWeights = { writing: 1/3, reading: 1/3, pairing: 1/3 };
    const totalPossibleWeight = 1.0; // Total weight is always 1.0 (100%)
    let weightedProgress = 0;
    
    Object.entries(exerciseWeights).forEach(([exerciseType, weight]) => {
      const attempts = lessonScore.exercises[exerciseType as keyof typeof lessonScore.exercises];
      if (attempts && attempts.length > 0) {
        const bestAttempt = attempts.reduce((best, current) => {
          const currentScore = this.calculateExerciseScore(current);
          const bestScore = this.calculateExerciseScore(best);
          return currentScore > bestScore ? current : best;
        });
        // Add weighted progress for completed exercises
        const accuracy = (bestAttempt.correctAnswers / bestAttempt.totalQuestions) * 100;
        weightedProgress += (accuracy * weight);
      }
      // Note: Incomplete exercises contribute 0 to weightedProgress
    });
    
    // Always divide by total possible weight (1.0), not just completed weight
    return Math.round(weightedProgress / totalPossibleWeight);
  }

  /**
   * Calculate total score for a lesson (computed property)
   */
  static calculateLessonTotalScore(lessonScore: LessonScore): number {
    let maxScore = 0;
    
    Object.values(lessonScore.exercises).forEach(attempts => {
      if (attempts && attempts.length > 0) {
        const bestAttempt = attempts.reduce((best, current) => {
          const currentScore = this.calculateExerciseScore(current);
          const bestScore = this.calculateExerciseScore(best);
          return currentScore > bestScore ? current : best;
        });
        const attemptScore = this.calculateExerciseScore(bestAttempt);
        maxScore = Math.max(maxScore, attemptScore);
      }
    });
    
    return maxScore;
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
    };
  }
  
}