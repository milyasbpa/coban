import localforage from "localforage";
import {
  VocabularyUserScore,
  VocabularyMasteryLevel,
  VocabularyExerciseResult,
  DEFAULT_VOCABULARY_MASTERY,
} from "../model/vocabulary-score";
import { VocabularyScoreCalculator } from "../utils/vocabulary-score-calculator";

// Simple storage for vocabulary scores only
const vocabularyStorage = localforage.createInstance({
  name: "coban-vocabulary",
  version: 1.0,
  size: 50 * 1024 * 1024, // 50MB
  storeName: "vocabulary_scores",
  description: "Vocabulary mastery and progress data",
});

export class VocabularyStorageManager {
  // ============ Basic Vocabulary Score Management ============

  static async saveVocabularyScore(userId: string, score: VocabularyUserScore): Promise<void> {
    score.updatedAt = new Date().toISOString();
    await vocabularyStorage.setItem(userId, score);
  }

  static async getVocabularyScore(userId: string): Promise<VocabularyUserScore | null> {
    return await vocabularyStorage.getItem(userId);
  }

  static async createDefaultVocabularyScore(
    userId: string,
    level: "N5" | "N4" | "N3" | "N2" | "N1" = "N5"
  ): Promise<VocabularyUserScore> {
    const defaultScore: VocabularyUserScore = {
      userId,
      level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vocabularyMastery: {},
    };

    await this.saveVocabularyScore(userId, defaultScore);
    return defaultScore;
  }

  // ============ Vocabulary Word Management ============

  static async saveVocabularyMastery(
    userId: string,
    vocabularyId: string,
    vocabularyMastery: VocabularyMasteryLevel
  ): Promise<void> {
    const userScore = await this.getVocabularyScore(userId);
    if (!userScore) return;

    // Update vocabulary mastery
    userScore.vocabularyMastery[vocabularyId] = vocabularyMastery;

    await this.saveVocabularyScore(userId, userScore);
  }

  static async getVocabularyMastery(
    userId: string,
    vocabularyId: string
  ): Promise<VocabularyMasteryLevel | null> {
    const userScore = await this.getVocabularyScore(userId);
    if (!userScore) {
      return null;
    }

    return userScore.vocabularyMastery[vocabularyId] || null;
  }

  // ============ Bulk Exercise Results ============

  static async saveExerciseResults(
    userId: string,
    results: VocabularyExerciseResult[]
  ): Promise<void> {
    const userScore = await this.getVocabularyScore(userId);
    if (!userScore) return;

    // Process each vocabulary result
    for (const result of results) {
      // Initialize vocabulary mastery if it doesn't exist
      if (!userScore.vocabularyMastery[result.vocabularyId]) {
        userScore.vocabularyMastery[result.vocabularyId] = {
          vocabularyId: result.vocabularyId,
          kanji: result.kanji,
          hiragana: result.hiragana,
          romaji: result.romaji,
          level: result.level,
          categoryId: "", // Will be set from vocabulary data if available
          ...DEFAULT_VOCABULARY_MASTERY,
        };
      }

      // Update vocabulary mastery based on result
      const currentVocabulary = userScore.vocabularyMastery[result.vocabularyId];
      
      userScore.vocabularyMastery[result.vocabularyId] = VocabularyScoreCalculator.updateVocabularyMastery(
        currentVocabulary,
        result
      );
    }

    await this.saveVocabularyScore(userId, userScore);
  }

  // ============ Data Management ============

  static async clearVocabularyData(userId: string): Promise<void> {
    await vocabularyStorage.removeItem(userId);
  }

  static async clearAllData(): Promise<void> {
    await vocabularyStorage.clear();
  }

  static async getStorageInfo(): Promise<{ vocabularyStorageLength: number }> {
    return {
      vocabularyStorageLength: await vocabularyStorage.length(),
    };
  }

  static async validateStorage(): Promise<boolean> {
    try {
      const testKey = "storage_test";
      const testValue = { test: true, timestamp: Date.now() };
      
      await vocabularyStorage.setItem(testKey, testValue);
      const retrieved = await vocabularyStorage.getItem(testKey);
      await vocabularyStorage.removeItem(testKey);
      
      return retrieved !== null;
    } catch (error) {
      console.error("Vocabulary storage validation failed:", error);
      return false;
    }
  }

  // ============ Analytics (Simplified) ============

  static async getVocabularyAnalytics(userId: string): Promise<{
    totalVocabulary: number;
    masteredVocabulary: number;
    averageProgress: number;
    recentActivity: string;
  }> {
    const userScore = await this.getVocabularyScore(userId);
    if (!userScore) {
      return {
        totalVocabulary: 0,
        masteredVocabulary: 0,
        averageProgress: 0,
        recentActivity: new Date().toISOString(),
      };
    }

    const report = VocabularyScoreCalculator.generateMasteryReport(userScore);
    
    return {
      totalVocabulary: Object.keys(userScore.vocabularyMastery).length,
      masteredVocabulary: report.masteredVocabulary,
      averageProgress: VocabularyScoreCalculator.calculateUserProgress(userScore),
      recentActivity: userScore.updatedAt,
    };
  }
}
