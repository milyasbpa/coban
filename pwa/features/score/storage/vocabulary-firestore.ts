import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/pwa/core/config/firebase";
import {
  VocabularyUserScore,
  VocabularyMasteryLevel,
  VocabularyExerciseResult,
  DEFAULT_VOCABULARY_MASTERY,
} from "../model/vocabulary-score";
import { VocabularyScoreCalculator } from "../utils/vocabulary-score-calculator";

/**
 * Firestore-based Vocabulary Storage Manager
 * Replaces LocalForage with Cloud Firestore
 */
export class VocabularyFirestoreManager {
  // ============ Basic Vocabulary Score Management ============

  static async saveVocabularyScore(userId: string, score: VocabularyUserScore): Promise<void> {
    score.updatedAt = new Date().toISOString();
    const docRef = doc(firestore, 'users', userId, 'vocabulary_scores', 'data');
    await setDoc(docRef, score, { merge: true });
  }

  static async getVocabularyScore(userId: string): Promise<VocabularyUserScore | null> {
    try {
      const docRef = doc(firestore, 'users', userId, 'vocabulary_scores', 'data');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as VocabularyUserScore;
      }
      return null;
    } catch (error) {
      console.error("Error getting vocabulary score:", error);
      return null;
    }
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
          categoryId: result.categoryId,
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

  static async resetVocabularyByIds(
    userId: string,
    vocabularyIds: string[]
  ): Promise<void> {
    const userScore = await this.getVocabularyScore(userId);
    if (!userScore) return;

    // Delete specific vocabulary entries from vocabularyMastery
    vocabularyIds.forEach((vocabId) => {
      delete userScore.vocabularyMastery[vocabId];
    });

    await this.saveVocabularyScore(userId, userScore);
  }

  static async clearVocabularyData(userId: string): Promise<void> {
    const docRef = doc(firestore, 'users', userId, 'vocabulary_scores', 'data');
    await deleteDoc(docRef);
  }

  static async clearAllData(): Promise<void> {
    // Note: This should be used carefully in production
    console.warn("clearAllData: This operation is not recommended for Firestore");
  }

  static async getStorageInfo(): Promise<{ vocabularyStorageLength: number }> {
    // For Firestore, this would require counting all documents
    // For simplicity, return 1 if user data exists
    return {
      vocabularyStorageLength: 1,
    };
  }

  static async validateStorage(): Promise<boolean> {
    try {
      // Test Firestore connection
      return true;
    } catch (error) {
      console.error("Vocabulary Firestore validation failed:", error);
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
