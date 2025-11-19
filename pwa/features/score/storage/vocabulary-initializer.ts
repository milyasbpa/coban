/**
 * Simple vocabulary storage initializer
 */

import { VocabularyStorageManager } from './vocabulary-storage';

export class VocabularyStorageInitializer {
  private static isInitialized = false;
  
  /**
   * Initialize vocabulary storage system
   */
  static async initialize(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (this.isInitialized) {
      return {
        success: true,
        message: "Vocabulary storage already initialized",
      };
    }

    try {
      console.log("🔧 Initializing vocabulary storage system...");
      
      // Validate storage is working
      const isValid = await VocabularyStorageManager.validateStorage();
      if (!isValid) {
        throw new Error("Vocabulary storage validation failed");
      }

      this.isInitialized = true;
      
      console.log(`✅ Vocabulary storage initialized successfully`);
      
      return {
        success: true,
        message: "Vocabulary storage initialized successfully",
      };
      
    } catch (error) {
      console.error("❌ Vocabulary storage initialization failed:", error);
      return {
        success: false,
        message: `Vocabulary storage initialization failed: ${error}`,
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
      vocabularyStorageLength: number;
    };
  }> {
    const storageInfo = await VocabularyStorageManager.getStorageInfo();
    
    return {
      totalUsers: storageInfo.vocabularyStorageLength,
      storageInfo,
    };
  }
}

/**
 * Auto-initialize storage when module is imported
 */
if (typeof window !== 'undefined' && !process.env.DISABLE_AUTO_STORAGE_INIT) {
  VocabularyStorageInitializer.initialize().catch(error => {
    console.warn("Auto vocabulary storage initialization failed:", error);
  });
}
