import {
  VocabularyExerciseResult,
  VocabularyMasteryLevel,
  VocabularyUserScore,
  VOCABULARY_MAX_SCORE,
  VOCABULARY_EXERCISE_TYPES,
} from "../model/vocabulary-score";

export class VocabularyScoreCalculator {
  // ============ Core Scoring Methods ============

  static calculateMaxScorePerExercise(): number {
    // For vocabulary: 100 total points / 3 exercise types = 33.33 per exercise
    return VOCABULARY_MAX_SCORE / VOCABULARY_EXERCISE_TYPES.length;
  }

  /**
   * Update vocabulary mastery with new exercise result
   */
  static updateVocabularyMastery(
    currentVocabulary: VocabularyMasteryLevel,
    result: VocabularyExerciseResult
  ): VocabularyMasteryLevel {
    const maxScorePerExercise = this.calculateMaxScorePerExercise();
    const now = new Date().toISOString();

    // Initialize exercise scores from current state
    const exerciseScores = { ...currentVocabulary.exerciseScores };
    let totalAttempts = currentVocabulary.totalAttempts + 1;
    let correctAttempts = currentVocabulary.correctAttempts;

    // Process the new result
    if (result.isCorrect) {
      correctAttempts++;
      // Award full score per exercise type
      exerciseScores[result.exerciseType] = maxScorePerExercise;
    }

    // Calculate aggregate mastery score (sum of all exercise scores)
    const masteryScore =
      exerciseScores.writing + exerciseScores.reading + exerciseScores.pairing;

    return {
      ...currentVocabulary,
      masteryScore,
      exerciseScores,
      totalAttempts,
      correctAttempts,
      lastSeen: now,
    };
  }

  // ============ Progress and Analytics ============

  static calculateUserProgress(userScore: VocabularyUserScore): number {
    const vocabularyArray = Object.values(userScore.vocabularyMastery);
    if (vocabularyArray.length === 0) return 0;

    const totalScore = vocabularyArray.reduce(
      (sum, vocab) => sum + vocab.masteryScore,
      0
    );
    const maxPossibleScore = vocabularyArray.length * VOCABULARY_MAX_SCORE;

    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  static generateMasteryReport(userScore: VocabularyUserScore): {
    totalVocabulary: number;
    masteredVocabulary: number;
    weakVocabulary: string[];
    strongVocabulary: string[];
  } {
    const allVocabulary = Object.values(userScore.vocabularyMastery);
    const totalVocabulary = allVocabulary.length;

    // Mastered = vocabulary with 90% or more of max score
    const masteredVocabulary = allVocabulary.filter(
      (vocab) => vocab.masteryScore >= VOCABULARY_MAX_SCORE * 0.9
    ).length;

    // Sort vocabulary by mastery score for weak/strong identification
    const sortedVocabulary = allVocabulary.sort(
      (a, b) => b.masteryScore - a.masteryScore
    );
    
    const weakVocabulary = sortedVocabulary.slice(-5).map((v) => v.kanji); // Bottom 5
    const strongVocabulary = sortedVocabulary.slice(0, 5).map((v) => v.kanji); // Top 5

    return {
      totalVocabulary,
      masteredVocabulary,
      weakVocabulary,
      strongVocabulary,
    };
  }

  // ============ Category-Based Analytics ============

  static getCategoryProgress(
    userScore: VocabularyUserScore,
    categoryId: string
  ): {
    totalInCategory: number;
    masteredInCategory: number;
    averageScore: number;
  } {
    const vocabularyInCategory = Object.values(userScore.vocabularyMastery)
      .filter((vocab) => vocab.categoryId === categoryId);

    const totalInCategory = vocabularyInCategory.length;
    const masteredInCategory = vocabularyInCategory.filter(
      (vocab) => vocab.masteryScore >= VOCABULARY_MAX_SCORE * 0.9
    ).length;

    const averageScore =
      totalInCategory > 0
        ? vocabularyInCategory.reduce((sum, vocab) => sum + vocab.masteryScore, 0) /
          totalInCategory
        : 0;

    return {
      totalInCategory,
      masteredInCategory,
      averageScore: Math.round(averageScore),
    };
  }
}
