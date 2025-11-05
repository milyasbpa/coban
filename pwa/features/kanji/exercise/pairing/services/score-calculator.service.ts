import { GameStats } from "../types";

/**
 * Score Calculator Service
 * Handles all score calculation logic
 */
export class ScoreCalculatorService {
  /**
   * Calculate score based on error words count and total words
   * Sistem penalty: Setiap kanji word yang salah (pertama kali) mengurangi score
   * Penalty proporsional = 100 / total words
   */
  static calculateScore(errorWordsCount: number, totalWords: number = 0): number {
    if (totalWords === 0) return 100;
    
    const penaltyPerUniqueWrongWord = 100 / totalWords;
    const totalPenalty = errorWordsCount * penaltyPerUniqueWrongWord;
    const newScore = 100 - totalPenalty;

    // Bulatkan dan clamp between 0-100
    return Math.max(0, Math.min(100, Math.round(newScore)));
  }

  /**
   * Calculate score for retry mode
   */
  static calculateRetryScore(
    originalTotalWords: number,
    globalWrongWordsCount: number,
    currentWrongWordsCount: number
  ): number {
    const penaltyPerWord = 100 / originalTotalWords;
    const totalUniqueWrongWords = globalWrongWordsCount + currentWrongWordsCount;
    const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
    const newScore = Math.max(0, 100 - totalPenalty);
    
    return Math.round(newScore);
  }

  /**
   * Calculate score with penalty from global accumulative wrong words
   */
  static calculateAccumulativeScore(
    originalTotalWords: number,
    allWrongWordsCount: number
  ): number {
    const penaltyPerWord = 100 / originalTotalWords;
    const totalPenalty = allWrongWordsCount * penaltyPerWord;
    const newScore = Math.max(0, 100 - totalPenalty);
    
    return Math.round(newScore);
  }
}