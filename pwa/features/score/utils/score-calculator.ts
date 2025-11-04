import { 
  QuestionResult, 
  WordMasteryLevel,
  KanjiMasteryLevel, 
  UserScore,
  ExerciseType,
  ColorCode,
  MAX_SCORE,
  EXERCISE_TYPES
} from '../model/score';

export class ScoreCalculator {
  
  // ============ Word-Based Scoring Core ============
  
  /**
   * Calculate maximum score per word based on formula: 100 / (total words in kanji × 3)
   * @param totalWordsInKanji Total number of words for this kanji
   * @returns Maximum score that can be earned per word
   */
  static calculateMaxScorePerWord(totalWordsInKanji: number): number {
    if (totalWordsInKanji <= 0) return 0;
    return MAX_SCORE / (totalWordsInKanji * EXERCISE_TYPES.length);
  }
  
  /**
   * Calculate maximum score per exercise: maxScorePerWord / 3
   * @param totalWordsInKanji Total number of words for this kanji
   * @returns Maximum score per exercise type (writing, reading, pairing)
   */
  static calculateMaxScorePerExercise(totalWordsInKanji: number): number {
    return this.calculateMaxScorePerWord(totalWordsInKanji) / EXERCISE_TYPES.length;
  }
  
  /**
   * Calculate word mastery score from QuestionResults
   * @param results Array of question results for this specific word
   * @param totalWordsInKanji Total words in parent kanji (for score calculation)
   * @returns Updated WordMasteryLevel
   */
  static calculateWordScore(
    results: QuestionResult[], 
    currentWord: WordMasteryLevel,
    totalWordsInKanji: number
  ): WordMasteryLevel {
    const maxScorePerExercise = this.calculateMaxScorePerExercise(totalWordsInKanji);
    const now = new Date().toISOString();
    
    // Initialize exercise scores from current state
    const exerciseScores = { ...currentWord.exerciseScores };
    let totalAttempts = currentWord.totalAttempts;
    let correctAttempts = currentWord.correctAttempts;
    
    // Process each new result
    results.forEach(result => {
      if (result.wordId === currentWord.wordId) {
        totalAttempts++;
        if (result.isCorrect) {
          correctAttempts++;
          // Award full score per exercise type
          exerciseScores[result.exerciseType] = maxScorePerExercise;
        }
        // Note: Incorrect answers don't reduce scores in this system
      }
    });
    
    // Calculate aggregate mastery score (sum of all exercise scores)
    const masteryScore = exerciseScores.writing + exerciseScores.reading + exerciseScores.pairing;
    
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
   * @param kanjiMastery Current kanji mastery level
   * @returns Updated kanji mastery with computed values
   */
  static calculateKanjiMastery(kanjiMastery: KanjiMasteryLevel): KanjiMasteryLevel {
    const words = Object.values(kanjiMastery.words);
    const now = new Date().toISOString();
    
    // Calculate overall score (sum of all word mastery scores)
    const overallScore = words.reduce((sum, word) => sum + word.masteryScore, 0);
    
    // Determine color code based on completion percentage
    const colorCode = this.getColorFromScore(overallScore);
    
    // Find most recent activity across all words
    const lastSeen = words.length > 0 
      ? words.reduce((latest, word) => word.lastSeen > latest ? word.lastSeen : latest, words[0].lastSeen)
      : now;
    
    return {
      ...kanjiMastery,
      overallScore,
      colorCode,
      lastSeen,
    };
  }
  
  /**
   * Update word mastery with new question result
   * @param currentWord Current word mastery state
   * @param result New question result
   * @param totalWordsInKanji Total words in parent kanji
   * @returns Updated word mastery
   */
  static updateWordMastery(
    currentWord: WordMasteryLevel,
    result: QuestionResult,
    totalWordsInKanji: number
  ): WordMasteryLevel {
    return this.calculateWordScore([result], currentWord, totalWordsInKanji);
  }
  
  // ============ Color and Progress Logic ============
  
  /**
   * Get color code based on score completion
   * @param score Current score
   * @returns Color code for UI visualization
   */
  static getColorFromScore(score: number): ColorCode {
    const percentage = (score / MAX_SCORE) * 100;
    
    if (percentage >= 90) return "green";    // Master level
    if (percentage >= 70) return "yellow";   // Advanced level
    if (percentage >= 40) return "orange";   // Intermediate level
    return "red";                            // Beginner level
  }
  
  /**
   * Calculate user progress across all kanji
   * @param userScore Current user score state
   * @returns Progress percentage (0-100)
   */
  static calculateUserProgress(userScore: UserScore): number {
    const kanjiArray = Object.values(userScore.kanjiMastery);
    if (kanjiArray.length === 0) return 0;
    
    const totalScore = kanjiArray.reduce((sum, kanji) => sum + kanji.overallScore, 0);
    const maxPossibleScore = kanjiArray.length * MAX_SCORE;
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  }
  
  /**
   * Generate mastery report for analytics
   * @param userScore Current user score state
   * @returns Detailed mastery analysis
   */
  static generateMasteryReport(userScore: UserScore): {
    totalWords: number;
    masteredWords: number;
    weakWords: string[];
    strongWords: string[];
  } {
    const allWords: WordMasteryLevel[] = [];
    
    // Collect all words from all kanji
    Object.values(userScore.kanjiMastery).forEach(kanji => {
      allWords.push(...Object.values(kanji.words));
    });
    
    const totalWords = allWords.length;
    const masteredWords = allWords.filter(word => {
      const parentKanji = Object.values(userScore.kanjiMastery).find(k => k.kanjiId === word.kanjiId);
      const totalWordsInKanji = parentKanji ? Object.values(parentKanji.words).length : 1;
      const maxScore = this.calculateMaxScorePerWord(totalWordsInKanji);
      return word.masteryScore >= maxScore * 0.9; // 90% completion = mastered
    }).length;
    
    // Sort words by mastery score for weak/strong identification
    const sortedWords = allWords.sort((a, b) => b.masteryScore - a.masteryScore);
    const weakWords = sortedWords.slice(-5).map(w => w.word); // Bottom 5
    const strongWords = sortedWords.slice(0, 5).map(w => w.word); // Top 5
    
    return {
      totalWords,
      masteredWords,
      weakWords,
      strongWords,
    };
  }
  
  /**
   * Convert legacy QuestionResult to new word-based format
   * @param legacy Legacy question result
   * @param wordId Generated word identifier
   * @param word The actual word text
   * @param exerciseType Type of exercise
   * @returns New format QuestionResult
   */
  static convertLegacyQuestionResult(
    legacy: { kanjiId: string; kanji: string; isCorrect: boolean },
    wordId: string,
    word: string,
    exerciseType: ExerciseType
  ): QuestionResult {
    return {
      kanjiId: legacy.kanjiId,
      kanji: legacy.kanji,
      isCorrect: legacy.isCorrect,
      wordId,
      word,
      exerciseType,
    };
  }
}