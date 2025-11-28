/**
 * Storage module exports
 * Provides Firestore-based scoring storage management
 */

export { KanjiFirestoreManager } from './kanji-firestore';
export { VocabularyFirestoreManager } from './vocabulary-firestore';

// Re-export types for convenience
export type {
  KanjiUserScore,
  KanjiWordLevel,
  KanjiMasteryLevel,
  KanjiExerciseResult,
} from '../model/kanji-score';

export type {
  VocabularyUserScore,
  VocabularyMasteryLevel,
  VocabularyExerciseResult,
} from '../model/vocabulary-score';