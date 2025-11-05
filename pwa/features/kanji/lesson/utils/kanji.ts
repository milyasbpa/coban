// Re-export KanjiService functions for backward compatibility
// These functions have been moved to KanjiService for centralized data access
import { KanjiService, type KanjiDetail } from '@/pwa/core/services/kanji'

export type { KanjiDetail }

// Re-export functions from KanjiService
export const getKanjiDetailsByCharacters = KanjiService.getKanjiDetailsByCharacters
export const getKanjiDetailsByLessonId = KanjiService.getKanjiDetailsByLessonId
export const getKanjiDetailsByTopicId = KanjiService.getKanjiDetailsByTopicId
