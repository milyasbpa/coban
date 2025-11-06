import localforage from "localforage";
import {
  KanjiUserScore,
  KanjiWordLevel,
  KanjiMasteryLevel,
  KanjiExerciseResult,
  DEFAULT_KANJI_WORD,
  DEFAULT_KANJI_MASTERY,
} from "../model/score";
import { KanjiScoreCalculator } from "../utils/score-calculator";

// Simple storage for kanji scores only
const kanjiStorage = localforage.createInstance({
  name: "coban-kanji",
  version: 1.0,
  size: 50 * 1024 * 1024, // 50MB
  storeName: "kanji_scores",
  description: "Kanji mastery and progress data",
});

export class KanjiStorageManager {
  // ============ Basic Kanji Score Management ============

  static async saveKanjiScore(userId: string, score: KanjiUserScore): Promise<void> {
    score.updatedAt = new Date().toISOString();
    await kanjiStorage.setItem(userId, score);
  }

  static async getKanjiScore(userId: string): Promise<KanjiUserScore | null> {
    return await kanjiStorage.getItem(userId);
  }

  static async createDefaultKanjiScore(
    userId: string,
    level: "N5" | "N4" | "N3" | "N2" | "N1" = "N5"
  ): Promise<KanjiUserScore> {
    const defaultScore: KanjiUserScore = {
      userId,
      level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanjiMastery: {},
    };

    await this.saveKanjiScore(userId, defaultScore);
    return defaultScore;
  }

  // ============ Kanji Word Management ============

  static async saveKanjiWordMastery(
    userId: string,
    kanjiId: string,
    wordId: string,
    wordMastery: KanjiWordLevel
  ): Promise<void> {
    const userScore = await this.getKanjiScore(userId);
    if (!userScore) return;

    // Initialize kanji mastery if it doesn't exist
    if (!userScore.kanjiMastery[kanjiId]) {
      userScore.kanjiMastery[kanjiId] = {
        kanjiId,
        character: wordMastery.word.charAt(0) || kanjiId, // Extract first character (kanji)
        level: userScore.level,
        ...DEFAULT_KANJI_MASTERY,
        words: {},
      };
    }

    // Update word mastery
    userScore.kanjiMastery[kanjiId].words[wordId] = wordMastery;

    // Recalculate kanji mastery
    userScore.kanjiMastery[kanjiId] = KanjiScoreCalculator.calculateKanjiMastery(
      userScore.kanjiMastery[kanjiId]
    );

    await this.saveKanjiScore(userId, userScore);
  }

  static async getKanjiWordMastery(
    userId: string,
    kanjiId: string,
    wordId: string
  ): Promise<KanjiWordLevel | null> {
    const userScore = await this.getKanjiScore(userId);
    if (!userScore || !userScore.kanjiMastery[kanjiId]) {
      return null;
    }

    return userScore.kanjiMastery[kanjiId].words[wordId] || null;
  }

  // ============ Bulk Exercise Results ============

  static async saveExerciseResults(
    userId: string,
    results: KanjiExerciseResult[]
  ): Promise<void> {
    const userScore = await this.getKanjiScore(userId);
    if (!userScore) return;

    // Group results by kanji
    const resultsByKanji = results.reduce((acc, result) => {
      if (!acc[result.kanjiId]) acc[result.kanjiId] = [];
      acc[result.kanjiId].push(result);
      return acc;
    }, {} as Record<string, KanjiExerciseResult[]>);

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
        // Initialize word mastery if doesn't exist
        if (!userScore.kanjiMastery[kanjiId].words[result.wordId]) {
          userScore.kanjiMastery[kanjiId].words[result.wordId] = {
            wordId: result.wordId,
            word: result.word,
            kanjiId: result.kanjiId,
            ...DEFAULT_KANJI_WORD,
          };
        }

        // Update word mastery based on result
        const currentWord = userScore.kanjiMastery[kanjiId].words[result.wordId];
        const totalWordsInKanji = Object.keys(userScore.kanjiMastery[kanjiId].words).length;
        
        userScore.kanjiMastery[kanjiId].words[result.wordId] = KanjiScoreCalculator.updateWordMastery(
          currentWord,
          result,
          totalWordsInKanji
        );
      }

      // Recalculate kanji mastery after all word updates
      userScore.kanjiMastery[kanjiId] = KanjiScoreCalculator.calculateKanjiMastery(
        userScore.kanjiMastery[kanjiId]
      );
    }

    await this.saveKanjiScore(userId, userScore);
  }

  // ============ Data Management ============

  static async clearKanjiData(userId: string): Promise<void> {
    await kanjiStorage.removeItem(userId);
  }

  static async clearAllData(): Promise<void> {
    await kanjiStorage.clear();
  }

  static async getStorageInfo(): Promise<{ kanjiStorageLength: number }> {
    return {
      kanjiStorageLength: await kanjiStorage.length(),
    };
  }

  static async validateStorage(): Promise<boolean> {
    try {
      const testKey = "storage_test";
      const testValue = { test: true, timestamp: Date.now() };
      
      await kanjiStorage.setItem(testKey, testValue);
      const retrieved = await kanjiStorage.getItem(testKey);
      await kanjiStorage.removeItem(testKey);
      
      return retrieved !== null;
    } catch (error) {
      console.error("Kanji storage validation failed:", error);
      return false;
    }
  }

  // ============ Analytics (Simplified) ============

  static async getKanjiAnalytics(userId: string): Promise<{
    totalKanji: number;
    totalWords: number;
    masteredWords: number;
    averageProgress: number;
    recentActivity: string;
  }> {
    const userScore = await this.getKanjiScore(userId);
    if (!userScore) {
      return {
        totalKanji: 0,
        totalWords: 0,
        masteredWords: 0,
        averageProgress: 0,
        recentActivity: new Date().toISOString(),
      };
    }

    const report = KanjiScoreCalculator.generateMasteryReport(userScore);
    
    return {
      totalKanji: Object.keys(userScore.kanjiMastery).length,
      totalWords: report.totalWords,
      masteredWords: report.masteredWords,
      averageProgress: KanjiScoreCalculator.calculateUserProgress(userScore),
      recentActivity: userScore.updatedAt,
    };
  }
}