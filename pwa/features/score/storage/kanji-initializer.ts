/**
 * Simple kanji storage initializer
 */

import { KanjiStorageManager } from './kanji-storage';

export class KanjiStorageInitializer {
  private static isInitialized = false;
  
  /**
   * Initialize kanji storage system
   */
  static async initialize(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (this.isInitialized) {
      return {
        success: true,
        message: "Kanji storage already initialized",
      };
    }

    try {
      console.log("🔧 Initializing kanji storage system...");
      
      // Validate storage is working
      const isValid = await KanjiStorageManager.validateStorage();
      if (!isValid) {
        throw new Error("Kanji storage validation failed");
      }

      this.isInitialized = true;
      
      console.log(`✅ Kanji storage initialized successfully`);
      
      return {
        success: true,
        message: "Kanji storage initialized successfully",
      };
      
    } catch (error) {
      console.error("❌ Kanji storage initialization failed:", error);
      return {
        success: false,
        message: `Kanji storage initialization failed: ${error}`,
      };
    }
  }

  /**
   * Reset initialization state
   */
  static reset(): void {
    this.isInitialized = false;
  }

  /**
   * Check if storage is initialized
   */
  static get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalUsers: number;
    storageInfo: {
      kanjiStorageLength: number;
    };
  }> {
    const storageInfo = await KanjiStorageManager.getStorageInfo();
    
    return {
      totalUsers: storageInfo.kanjiStorageLength,
      storageInfo,
    };
  }
}

/**
 * Auto-initialize storage when module is imported
 */
if (typeof window !== 'undefined' && !process.env.DISABLE_AUTO_STORAGE_INIT) {
  KanjiStorageInitializer.initialize().catch(error => {
    console.warn("Auto kanji storage initialization failed:", error);
  });
}