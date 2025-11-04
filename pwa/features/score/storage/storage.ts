import localforage from "localforage";
import {
  UserScore,
  ExerciseAttempt,
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
      category: "kanji",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      overallStats: {
        totalScore: 0,
        totalExercisesCompleted: 0,
        averageAccuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: new Date().toISOString(),
      },
      lessonProgress: {},
      exerciseScores: {
        writing: {
          totalAttempts: 0,
          bestScore: 0,
          averageScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          overallAccuracy: 0,
        },
        reading: {
          totalAttempts: 0,
          bestScore: 0,
          averageScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          overallAccuracy: 0,
        },
        pairing: {
          totalAttempts: 0,
          bestScore: 0,
          averageScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          overallAccuracy: 0,
        },
      },
      kanjiMastery: {},
    };

    await this.saveUserScore(userId, defaultScore);
    return defaultScore;
  }

  // ============ Exercise Attempt Management ============

  static async saveExerciseAttempt(attempt: ExerciseAttempt): Promise<void> {
    const key = `${attempt.lessonId}_${attempt.exerciseType}_${attempt.attemptId}`;
    await exerciseStorage.setItem(key, attempt);
  }

  static async getExerciseAttempt(
    attemptId: string
  ): Promise<ExerciseAttempt | null> {
    return await exerciseStorage.getItem(attemptId);
  }

  static async getRecentAttempts(
    limit: number = 10
  ): Promise<ExerciseAttempt[]> {
    const attempts: ExerciseAttempt[] = [];

    await exerciseStorage.iterate((attempt: ExerciseAttempt) => {
      attempts.push(attempt);
    });

    return attempts
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
      .slice(0, limit);
  }

  static async getAttemptsByLesson(
    lessonId: string
  ): Promise<ExerciseAttempt[]> {
    const attempts: ExerciseAttempt[] = [];

    await exerciseStorage.iterate((attempt: ExerciseAttempt) => {
      if (attempt.lessonId === lessonId) {
        attempts.push(attempt);
      }
    });

    return attempts.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  static async getAttemptsByExerciseType(
    exerciseType: "writing" | "reading" | "pairing"
  ): Promise<ExerciseAttempt[]> {
    const attempts: ExerciseAttempt[] = [];

    await exerciseStorage.iterate((attempt: ExerciseAttempt) => {
      if (attempt.exerciseType === exerciseType) {
        attempts.push(attempt);
      }
    });

    return attempts.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  // ============ Data Management & Cleanup ============

  static async clearUserData(userId: string): Promise<void> {
    // Clear user scores
    await scoreStorage.removeItem(userId);

    // Clear exercise attempts
    const keysToRemove: string[] = [];
    await exerciseStorage.iterate((attempt: ExerciseAttempt, key: string) => {
      // Assuming we can identify user data by some pattern or we store userId in attempts
      keysToRemove.push(key);
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

  // ============ Migration & Maintenance ============

  static async migrateData(): Promise<void> {
    // Future migration logic can be added here
    console.info("StorageManager: No migrations needed");
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
}
