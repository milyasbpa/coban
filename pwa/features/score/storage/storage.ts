import localforage from "localforage";
import {
  UserScore,
  WordMasteryLevel,
  KanjiMasteryLevel,
  QuestionResult,
  DEFAULT_WORD_MASTERY,
  DEFAULT_KANJI_MASTERY,
} from "../model/score";



// Configure LocalForage instances for different data types
const scoreStorage = localforage.createInstance({
  name: "coban-scores",
  version: 1.0,
  size: 50 * 1024 * 1024, // 50MB
  storeName: "user_scores",
  description: "User progress and score data",
});

const exerciseStorage = localforage.createInstance({
  name: "coban-exercises",
  version: 1.0,
  size: 50 * 1024 * 1024, // 50MB
  storeName: "exercise_attempts",
  description: "Detailed exercise attempt data",
});

const analyticsStorage = localforage.createInstance({
  name: "coban-analytics",
  version: 1.0,
  size: 20 * 1024 * 1024, // 20MB
  storeName: "learning_analytics",
  description: "Learning analytics and progress data",
});

export class StorageManager {
  // ============ User Score Management ============

  static async saveUserScore(userId: string, score: UserScore): Promise<void> {
    score.updatedAt = new Date().toISOString();
    await scoreStorage.setItem(userId, score);
  }

  static async getUserScore(userId: string): Promise<UserScore | null> {
    return await scoreStorage.getItem(userId);
  }

  static async createDefaultUserScore(
    userId: string,
    level: "N5" | "N4" | "N3" | "N2" | "N1" = "N5"
  ): Promise<UserScore> {
    const defaultScore: UserScore = {
      userId,
      level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanjiMastery: {},
    };

    await this.saveUserScore(userId, defaultScore);
    return defaultScore;
  }

  // ============ Word-Based Data Management ============

  /**
   * Save or update word mastery data
   */
  static async saveWordMastery(
    userId: string,
    kanjiId: string,
    wordId: string,
    wordMastery: WordMasteryLevel
  ): Promise<void> {
    const userScore = await this.getUserScore(userId);
    if (!userScore) return;

    // Initialize kanji mastery if it doesn't exist
    if (!userScore.kanjiMastery[kanjiId]) {
      userScore.kanjiMastery[kanjiId] = {
        kanjiId,
        character: wordMastery.kanjiId, // Use as character for now
        level: userScore.level,
        ...DEFAULT_KANJI_MASTERY,
        words: {},
      };
    }

    // Update word mastery
    userScore.kanjiMastery[kanjiId].words[wordId] = wordMastery;

    // Recalculate kanji mastery
    const { ScoreCalculator } = await import("../utils/score-calculator");
    userScore.kanjiMastery[kanjiId] = ScoreCalculator.calculateKanjiMastery(
      userScore.kanjiMastery[kanjiId]
    );

    await this.saveUserScore(userId, userScore);
  }

  /**
   * Get word mastery for specific word
   */
  static async getWordMastery(
    userId: string,
    kanjiId: string,
    wordId: string
  ): Promise<WordMasteryLevel | null> {
    const userScore = await this.getUserScore(userId);
    if (!userScore || !userScore.kanjiMastery[kanjiId]) {
      return null;
    }

    return userScore.kanjiMastery[kanjiId].words[wordId] || null;
  }

  /**
   * Get all words for a specific kanji
   */
  static async getKanjiWords(
    userId: string,
    kanjiId: string
  ): Promise<WordMasteryLevel[]> {
    const userScore = await this.getUserScore(userId);
    if (!userScore || !userScore.kanjiMastery[kanjiId]) {
      return [];
    }

    return Object.values(userScore.kanjiMastery[kanjiId].words);
  }

  /**
   * Save multiple question results (batch update)
   */
  static async saveQuestionResults(
    userId: string,
    results: QuestionResult[]
  ): Promise<void> {
    const userScore = await this.getUserScore(userId);
    if (!userScore) return;

    const { ScoreCalculator } = await import("../utils/score-calculator");
    const { KanjiWordMapper } = await import("../utils/kanji-word-mapper");

    // Group results by kanji
    const resultsByKanji = results.reduce((acc, result) => {
      if (!acc[result.kanjiId]) {
        acc[result.kanjiId] = [];
      }
      acc[result.kanjiId].push(result);
      return acc;
    }, {} as Record<string, QuestionResult[]>);

    // Process each kanji's results
    for (const [kanjiId, kanjiResults] of Object.entries(resultsByKanji)) {
      // Initialize kanji mastery if it doesn't exist
      if (!userScore.kanjiMastery[kanjiId]) {
        userScore.kanjiMastery[kanjiId] = {
          kanjiId,
          character: kanjiResults[0].kanji,
          level: userScore.level,
          ...DEFAULT_KANJI_MASTERY,
          words: {},
        };
      }

      // Process each word result
      for (const result of kanjiResults) {
        if (result.wordId && result.word) {
          // Initialize word mastery if it doesn't exist
          if (!userScore.kanjiMastery[kanjiId].words[result.wordId]) {
            userScore.kanjiMastery[kanjiId].words[result.wordId] = {
              wordId: result.wordId,
              word: result.word,
              kanjiId: result.kanjiId,
              ...DEFAULT_WORD_MASTERY,
            };
          }

          // Get total words for accurate score calculation
          const totalWords = KanjiWordMapper.getTotalWordsForKanji(result.word, userScore.level);

          // Update word mastery with new result
          const currentWord = userScore.kanjiMastery[kanjiId].words[result.wordId];
          userScore.kanjiMastery[kanjiId].words[result.wordId] = 
            ScoreCalculator.updateWordMastery(currentWord, result, totalWords);
        }
      }

      // Recalculate kanji mastery after all word updates
      userScore.kanjiMastery[kanjiId] = ScoreCalculator.calculateKanjiMastery(
        userScore.kanjiMastery[kanjiId]
      );
    }

    await this.saveUserScore(userId, userScore);
  }

  // ============ Data Management & Cleanup ============

  static async clearUserData(userId: string): Promise<void> {
    // Clear user scores
    await scoreStorage.removeItem(userId);

    // Clear word-based exercise data (if stored separately)
    const keysToRemove: string[] = [];
    await exerciseStorage.iterate((data: any, key: string) => {
      if (key.startsWith(userId)) {
        keysToRemove.push(key);
      }
    });

    for (const key of keysToRemove) {
      await exerciseStorage.removeItem(key);
    }

    // Clear analytics
    const analyticsKeysToRemove: string[] = [];
    await analyticsStorage.iterate((data: any, key: string) => {
      if (key.startsWith(userId)) {
        analyticsKeysToRemove.push(key);
      }
    });

    for (const key of analyticsKeysToRemove) {
      await analyticsStorage.removeItem(key);
    }
  }

  static async clearAllData(): Promise<void> {
    await scoreStorage.clear();
    await exerciseStorage.clear();
    await analyticsStorage.clear();
  }

  static async getStorageInfo(): Promise<{
    scoreStorageLength: number;
    exerciseStorageLength: number;
    analyticsStorageLength: number;
  }> {
    return {
      scoreStorageLength: await scoreStorage.length(),
      exerciseStorageLength: await exerciseStorage.length(),
      analyticsStorageLength: await analyticsStorage.length(),
    };
  }

  // ============ Maintenance ============

  /**
   * Simple data validation and cleanup
   */
  static async validateAndCleanup(): Promise<void> {
    console.info("StorageManager: Performing data validation and cleanup");
    // Simple validation - future cleanup logic can be added here if needed
  }

  static async validateStorage(): Promise<boolean> {
    try {
      const testKey = "storage_test";
      const testValue = { test: true, timestamp: Date.now() };

      await scoreStorage.setItem(testKey, testValue);
      const retrieved = await scoreStorage.getItem(testKey);
      await scoreStorage.removeItem(testKey);

      return retrieved !== null;
    } catch (error) {
      console.error("StorageManager: Storage validation failed", error);
      return false;
    }
  }

  // ============ Word-Based Analytics ============

  /**
   * Get learning progress analytics for a user
   */
  static async getUserAnalytics(userId: string): Promise<{
    totalKanji: number;
    totalWords: number;
    masteredWords: number;
    averageProgress: number;
    strongestKanji: string[];
    weakestKanji: string[];
    recentActivity: string;
  }> {
    const userScore = await this.getUserScore(userId);
    if (!userScore) {
      return {
        totalKanji: 0,
        totalWords: 0,
        masteredWords: 0,
        averageProgress: 0,
        strongestKanji: [],
        weakestKanji: [],
        recentActivity: new Date().toISOString(),
      };
    }

    const { ScoreCalculator } = await import("../utils/score-calculator");
    const report = ScoreCalculator.generateMasteryReport(userScore);
    
    const kanjiArray = Object.values(userScore.kanjiMastery);
    const sortedByScore = kanjiArray.sort((a, b) => b.overallScore - a.overallScore);
    
    return {
      totalKanji: kanjiArray.length,
      totalWords: report.totalWords,
      masteredWords: report.masteredWords,
      averageProgress: ScoreCalculator.calculateUserProgress(userScore),
      strongestKanji: sortedByScore.slice(0, 5).map(k => k.character),
      weakestKanji: sortedByScore.slice(-5).map(k => k.character),
      recentActivity: userScore.updatedAt,
    };
  }

  /**
   * Export user data for backup or analysis
   */
  static async exportUserData(userId: string): Promise<string> {
    const userScore = await this.getUserScore(userId);
    if (!userScore) {
      throw new Error(`User ${userId} not found`);
    }

    const analytics = await this.getUserAnalytics(userId);
    
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      userData: userScore,
      analytics,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import user data from backup
   */
  static async importUserData(userId: string, importData: string): Promise<boolean> {
    try {
      const data = JSON.parse(importData);
      
      if (data.version && data.userData) {
        await this.saveUserScore(userId, data.userData);
        console.log(`Successfully imported data for user: ${userId}`);
        return true;
      } else {
        throw new Error("Invalid import data format");
      }
    } catch (error) {
      console.error(`Failed to import data for user ${userId}:`, error);
      return false;
    }
  }
}
