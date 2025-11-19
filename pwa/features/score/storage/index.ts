/**
 * Kanji storage module exports
 * Provides kanji scoring storage management
 */

export { KanjiStorageManager } from './kanji-storage';
export { KanjiStorageInitializer } from './kanji-initializer';

// Re-export types for convenience
export type {
  KanjiUserScore,
  KanjiWordLevel,
  KanjiMasteryLevel,
  KanjiExerciseResult,
} from '../model/kanji-score';