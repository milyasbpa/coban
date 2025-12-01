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
    // Iterate through nested structure: level -> categoryId -> vocabularyId
    let totalScore = 0;
    let totalVocabulary = 0;

    for (const level in userScore.vocabularyMastery) {
      for (const categoryId in userScore.vocabularyMastery[level]) {
        const categoryMastery = userScore.vocabularyMastery[level][categoryId];
        for (const vocabId in categoryMastery) {
          totalScore += categoryMastery[vocabId].masteryScore;
          totalVocabulary++;
        }
      }
    }

    if (totalVocabulary === 0) return 0;

    const maxPossibleScore = totalVocabulary * VOCABULARY_MAX_SCORE;

    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  static generateMasteryReport(userScore: VocabularyUserScore): {
    totalVocabulary: number;
    masteredVocabulary: number;
    weakVocabulary: string[];
    strongVocabulary: string[];
  } {
    // Collect all vocabulary from nested structure
    const allVocabulary: VocabularyMasteryLevel[] = [];

    for (const level in userScore.vocabularyMastery) {
      for (const categoryId in userScore.vocabularyMastery[level]) {
        const categoryMastery = userScore.vocabularyMastery[level][categoryId];
        for (const vocabId in categoryMastery) {
          allVocabulary.push(categoryMastery[vocabId]);
        }
      }
    }

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
    categoryId: string,
    level: string
  ): {
    totalInCategory: number;
    masteredInCategory: number;
    averageScore: number;
  } {
    // Access nested path: level -> categoryId
    const categoryMastery = userScore.vocabularyMastery[level]?.[categoryId];
    if (!categoryMastery) {
      return {
        totalInCategory: 0,
        masteredInCategory: 0,
        averageScore: 0,
      };
    }

    const vocabularyInCategory = Object.values(categoryMastery);

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
