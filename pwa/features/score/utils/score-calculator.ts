import {
  KanjiExerciseResult,
  KanjiWordLevel,
  KanjiMasteryLevel,
  KanjiUserScore,
  MAX_SCORE,
  EXERCISE_TYPES,
} from "../model/kanji-score";

export class KanjiScoreCalculator {
  // ============ Core Scoring Methods ============

  static calculateMaxScorePerExercise(totalWordsInKanji: number): number {
    if (totalWordsInKanji <= 0) return 0;
    return (
      MAX_SCORE /
      (totalWordsInKanji * EXERCISE_TYPES.length * EXERCISE_TYPES.length)
    );
  }

  /**
   * Update kanji word mastery with new exercise result
   */
  static updateWordMastery(
    currentWord: KanjiWordLevel,
    result: KanjiExerciseResult,
    totalWordsInKanji: number
  ): KanjiWordLevel {
    const maxScorePerExercise =
      this.calculateMaxScorePerExercise(totalWordsInKanji);
    const now = new Date().toISOString();

    // Initialize exercise scores from current state
    const exerciseScores = { ...currentWord.exerciseScores };
    let totalAttempts = currentWord.totalAttempts + 1;
    let correctAttempts = currentWord.correctAttempts;

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
      ...currentWord,
      masteryScore,
      exerciseScores,
      totalAttempts,
      correctAttempts,
      lastSeen: now,
    };
  }

  /**
   * Calculate kanji mastery from all its words
   */
  static calculateKanjiMastery(
    kanjiMastery: KanjiMasteryLevel
  ): KanjiMasteryLevel {
    const words = Object.values(kanjiMastery.words);
    const now = new Date().toISOString();

    // Calculate overall score (sum of all word mastery scores)
    const overallScore = words.reduce(
      (sum, word) => sum + word.masteryScore,
      0
    );

    // Find most recent activity across all words
    const lastSeen =
      words.length > 0
        ? words.reduce(
            (latest, word) => (word.lastSeen > latest ? word.lastSeen : latest),
            words[0].lastSeen
          )
        : now;

    return {
      ...kanjiMastery,
      overallScore,
      lastSeen,
    };
  }

  // ============ Progress and Analytics ============

  static calculateUserProgress(userScore: KanjiUserScore): number {
    const kanjiArray = Object.values(userScore.kanjiMastery);
    if (kanjiArray.length === 0) return 0;

    const totalScore = kanjiArray.reduce(
      (sum, kanji) => sum + kanji.overallScore,
      0
    );
    const maxPossibleScore = kanjiArray.length * MAX_SCORE;

    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  static generateMasteryReport(userScore: KanjiUserScore): {
    totalWords: number;
    masteredWords: number;
    weakWords: string[];
    strongWords: string[];
  } {
    const allWords: KanjiWordLevel[] = [];

    // Collect all words from all kanji
    Object.values(userScore.kanjiMastery).forEach((kanji) => {
      allWords.push(...Object.values(kanji.words));
    });

    const totalWords = allWords.length;
    const masteredWords = allWords.filter((word) => {
      const parentKanji = Object.values(userScore.kanjiMastery).find(
        (k) => k.kanjiId === word.kanjiId
      );
      const totalWordsInKanji = parentKanji
        ? Object.values(parentKanji.words).length
        : 1;
      const maxScorePerExercise =
        this.calculateMaxScorePerExercise(totalWordsInKanji);
      const maxScore = maxScorePerExercise * EXERCISE_TYPES.length; // Total max for all exercises
      return word.masteryScore >= maxScore * 0.9; // 90% completion = mastered
    }).length;

    // Sort words by mastery score for weak/strong identification
    const sortedWords = allWords.sort(
      (a, b) => b.masteryScore - a.masteryScore
    );
    const weakWords = sortedWords.slice(-5).map((w) => w.word); // Bottom 5
    const strongWords = sortedWords.slice(0, 5).map((w) => w.word); // Top 5

    return {
      totalWords,
      masteredWords,
      weakWords,
      strongWords,
    };
  }
}
