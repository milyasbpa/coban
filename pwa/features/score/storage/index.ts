/**
 * Storage module exports
 * Provides word-based scoring storage management
 */

export { StorageManager } from './storage';
export { StorageInitializer } from './initializer';

// Re-export types for convenience
export type {
  UserScore,
  WordMasteryLevel,
  KanjiMasteryLevel,
  QuestionResult,
} from '../model/score';