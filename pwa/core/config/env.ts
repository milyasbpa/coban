// Environment configuration for feature flags
export const config = {
  // Development features
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Feature flags
  featureFlags: {
    // Show reset statistics button in development
    showResetStatistics: process.env.NODE_ENV === 'development' || process.env.ENABLE_RESET_STATS === 'true',
    
    // Show debug information
    showDebugInfo: process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG === 'true',
    
    // Enable analytics collection
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    
    // Show performance metrics
    showPerformanceMetrics: process.env.NODE_ENV === 'development' || process.env.SHOW_PERFORMANCE === 'true',
    
    // Enable experimental features
    enableExperimentalFeatures: process.env.ENABLE_EXPERIMENTAL === 'true',
  },
  
  // Storage configuration
  storage: {
    // Clear storage on app start (development only)
    clearOnStart: process.env.CLEAR_STORAGE_ON_START === 'true',
    
    // Storage size limits (in MB)
    maxStorageSize: parseInt(process.env.MAX_STORAGE_SIZE_MB || '100'),
    
    // Backup frequency (in days)
    backupFrequency: parseInt(process.env.BACKUP_FREQUENCY_DAYS || '7'),
  },
  
  // User defaults
  defaults: {
    userId: process.env.DEFAULT_USER_ID || 'default-user',
    level: (process.env.DEFAULT_LEVEL as "N5" | "N4" | "N3" | "N2" | "N1") || 'N5',
  },
  
  // API configuration (for future use)
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    timeout: parseInt(process.env.API_TIMEOUT_MS || '10000'),
  }
} as const;

// Utility functions
export const isFeatureEnabled = (featureName: keyof typeof config.featureFlags): boolean => {
  return config.featureFlags[featureName];
};

export const isDevelopment = (): boolean => {
  return config.isDevelopment;
};

export const isProduction = (): boolean => {
  return config.isProduction;
};

// Development utilities
export const devLog = (message: string, ...args: any[]): void => {
  if (config.isDevelopment) {
    console.log(`[DEV] ${message}`, ...args);
  }
};

export const devWarn = (message: string, ...args: any[]): void => {
  if (config.isDevelopment) {
    console.warn(`[DEV] ${message}`, ...args);
  }
};

export const devError = (message: string, ...args: any[]): void => {
  if (config.isDevelopment) {
    console.error(`[DEV] ${message}`, ...args);
  }
};