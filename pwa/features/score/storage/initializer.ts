/**
 * Storage initialization and migration helper
 * This should be called when the app starts to ensure data compatibility
 */

import { StorageManager } from './storage';

export class StorageInitializer {
  private static isInitialized = false;
  
  /**
   * Initialize storage system
   * Should be called once when app starts
   */
  static async initialize(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (this.isInitialized) {
      return {
        success: true,
        message: "Storage already initialized",
      };
    }

    try {
      console.log("🔧 Initializing storage system...");
      
      // Validate storage is working
      const isValid = await StorageManager.validateStorage();
      if (!isValid) {
        throw new Error("Storage validation failed");
      }

      // Perform simple cleanup if needed
      await StorageManager.validateAndCleanup();

      this.isInitialized = true;
      
      console.log(`✅ Storage initialized successfully`);
      
      return {
        success: true,
        message: "Storage initialized successfully",
      };
      
    } catch (error) {
      console.error("❌ Storage initialization failed:", error);
      return {
        success: false,
        message: `Storage initialization failed: ${error}`,
      };
    }
  }

  /**
   * Reset initialization state (useful for testing)
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
      scoreStorageLength: number;
      exerciseStorageLength: number;
      analyticsStorageLength: number;
    };
  }> {
    const storageInfo = await StorageManager.getStorageInfo();
    
    return {
      totalUsers: storageInfo.scoreStorageLength,
      storageInfo,
    };
  }
}

/**
 * Auto-initialize storage when module is imported
 * Can be disabled by setting environment variable
 */
if (typeof window !== 'undefined' && !process.env.DISABLE_AUTO_STORAGE_INIT) {
  // Only run in browser environment and if not disabled
  StorageInitializer.initialize().catch(error => {
    console.warn("Auto storage initialization failed:", error);
  });
}