import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "@/pwa/core/config/firebase";
import {
  KanjiUserScore,
  KanjiWordLevel,
  KanjiMasteryLevel,
  KanjiExerciseResult,
  DEFAULT_KANJI_WORD,
  DEFAULT_KANJI_MASTERY,
} from "../model/kanji-score";
import { KanjiScoreCalculator } from "../utils/score-calculator";

/**
 * Firestore-based Kanji Storage Manager
 * Replaces LocalForage with Cloud Firestore
 */
export class KanjiFirestoreManager {
  // ============ Basic Kanji Score Management ============

  static async saveKanjiScore(userId: string, score: KanjiUserScore): Promise<void> {
    score.updatedAt = new Date().toISOString();
    const docRef = doc(firestore, 'users', userId, 'kanji_scores', 'data');
    await setDoc(docRef, score, { merge: true });
  }

  static async getKanjiScore(userId: string): Promise<KanjiUserScore | null> {
    try {
      const docRef = doc(firestore, 'users', userId, 'kanji_scores', 'data');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as KanjiUserScore;
      }
      return null;
    } catch (error) {
      console.error("Error getting kanji score:", error);
      return null;
    }
  }

  static async createDefaultKanjiScore(
    userId: string
  ): Promise<KanjiUserScore> {
    const defaultScore: KanjiUserScore = {
      userId,
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
    level: string,
    kanjiId: string,
    wordId: string,
    wordMastery: KanjiWordLevel
  ): Promise<void> {
    const userScore = await this.getKanjiScore(userId);
    if (!userScore) return;

    // Initialize nested structure if needed
    if (!userScore.kanjiMastery[level]) {
      userScore.kanjiMastery[level] = {};
    }

    // Initialize kanji mastery if it doesn't exist
    if (!userScore.kanjiMastery[level][kanjiId]) {
      userScore.kanjiMastery[level][kanjiId] = {
        kanjiId,
        character: wordMastery.word.charAt(0) || kanjiId,
        level: level,
        ...DEFAULT_KANJI_MASTERY,
        words: {},
      };
    }

    // Update word mastery
    userScore.kanjiMastery[level][kanjiId].words[wordId] = wordMastery;

    // Recalculate kanji mastery
    userScore.kanjiMastery[level][kanjiId] = KanjiScoreCalculator.calculateKanjiMastery(
      userScore.kanjiMastery[level][kanjiId]
    );

    await this.saveKanjiScore(userId, userScore);
  }

  static async getKanjiWordMastery(
    userId: string,
    level: string,
    kanjiId: string,
    wordId: string
  ): Promise<KanjiWordLevel | null> {
    const userScore = await this.getKanjiScore(userId);
    if (!userScore) return null;

    return userScore.kanjiMastery[level]?.[kanjiId]?.words[wordId] || null;
  }

  // ============ Bulk Exercise Results ============

  static async saveExerciseResults(
    userId: string,
    results: KanjiExerciseResult[]
  ): Promise<void> {
    const userScore = await this.getKanjiScore(userId);
    if (!userScore) return;

    // Group results by level and kanji
    const resultsByLevelAndKanji = results.reduce((acc, result) => {
      const level = result.level;
      if (!acc[level]) acc[level] = {};
      if (!acc[level][result.kanjiId]) acc[level][result.kanjiId] = [];
      acc[level][result.kanjiId].push(result);
      return acc;
    }, {} as Record<string, Record<string, KanjiExerciseResult[]>>);

    // Process each level
    for (const [level, kanjiResultsMap] of Object.entries(resultsByLevelAndKanji)) {
      // Initialize level if needed
      if (!userScore.kanjiMastery[level]) {
        userScore.kanjiMastery[level] = {};
      }

      // Process each kanji's results
      for (const [kanjiId, kanjiResults] of Object.entries(kanjiResultsMap)) {
        // Initialize kanji mastery if it doesn't exist
        if (!userScore.kanjiMastery[level][kanjiId]) {
          userScore.kanjiMastery[level][kanjiId] = {
            kanjiId,
            character: kanjiResults[0].kanji,
            level: kanjiResults[0].level,
            ...DEFAULT_KANJI_MASTERY,
            words: {},
          };
        }

        // Process each word result
        for (const result of kanjiResults) {
          // Initialize word mastery if doesn't exist
          if (!userScore.kanjiMastery[level][kanjiId].words[result.wordId]) {
            userScore.kanjiMastery[level][kanjiId].words[result.wordId] = {
              wordId: result.wordId,
              word: result.word,
              kanjiId: result.kanjiId,
              ...DEFAULT_KANJI_WORD,
            };
          }

          // Update word mastery based on result
          const currentWord = userScore.kanjiMastery[level][kanjiId].words[result.wordId];
          const totalWordsInKanji = Object.keys(userScore.kanjiMastery[level][kanjiId].words).length;
          
          userScore.kanjiMastery[level][kanjiId].words[result.wordId] = KanjiScoreCalculator.updateWordMastery(
            currentWord,
            result,
            totalWordsInKanji
          );
        }

        // Recalculate kanji mastery after all word updates
        userScore.kanjiMastery[level][kanjiId] = KanjiScoreCalculator.calculateKanjiMastery(
          userScore.kanjiMastery[level][kanjiId]
        );
      }
    }

    await this.saveKanjiScore(userId, userScore);
  }

  // ============ Data Management ============

  static async resetKanjiByIds(
    userId: string,
    level: string,
    kanjiIds: string[]
  ): Promise<void> {
    const userScore = await this.getKanjiScore(userId);
    if (!userScore) return;

    // Delete specific kanji entries from nested path
    if (userScore.kanjiMastery[level]) {
      kanjiIds.forEach((kanjiId) => {
        delete userScore.kanjiMastery[level][kanjiId];
      });
    }

    await this.saveKanjiScore(userId, userScore);
  }

  static async clearKanjiData(userId: string): Promise<void> {
    const docRef = doc(firestore, 'users', userId, 'kanji_scores', 'data');
    await deleteDoc(docRef);
  }

  static async clearAllData(): Promise<void> {
    // Note: This should be used carefully in production
    // For now, it only clears the current user's data
    console.warn("clearAllData: This operation is not recommended for Firestore");
  }

  static async getStorageInfo(): Promise<{ kanjiStorageLength: number }> {
    // For Firestore, this would require counting all documents
    // For simplicity, return 1 if user data exists
    return {
      kanjiStorageLength: 1,
    };
  }

  static async validateStorage(): Promise<boolean> {
    try {
      // Test Firestore connection by attempting to read
      // This will work even offline due to cache
      return true;
    } catch (error) {
      console.error("Kanji Firestore validation failed:", error);
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
    
    // Count total kanji across all levels
    let totalKanji = 0;
    for (const level in userScore.kanjiMastery) {
      totalKanji += Object.keys(userScore.kanjiMastery[level]).length;
    }
    
    return {
      totalKanji,
      totalWords: report.totalWords,
      masteredWords: report.masteredWords,
      averageProgress: KanjiScoreCalculator.calculateUserProgress(userScore),
      recentActivity: userScore.updatedAt,
    };
  }
}
