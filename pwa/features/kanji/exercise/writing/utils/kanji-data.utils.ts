// Utility functions for loading kanji data
import n5KanjiData from '@/data/n5/kanji/kanji.json';

export interface KanjiItem {
  id: number;
  character: string;
  strokes: number;
  readings: {
    kun?: Array<{
      furigana: string;
      romanji: string;
    }>;
    on?: Array<{
      furigana: string;
      romanji: string;
    }>;
  };
  meanings: {
    id: string;
    en: string;
  };
  examples?: Array<{
    word: string;
    furigana: string;
    romanji: string;
    meaning_id: string;
    meaning_en: string;
  }>;
}

export interface WritingQuestion {
  kanji: string;
  reading: string;
  meaning: string;
  audio?: string;
}

/**
 * Get kanji data based on level
 */
export function getKanjiData(level: string): KanjiItem[] {
  switch (level.toLowerCase()) {
    case 'n5':
      return n5KanjiData.items || [];
    // Add other levels when available
    // case 'n4':
    //   return n4KanjiData.items || [];
    default:
      console.warn(`Level ${level} not supported, falling back to N5`);
      return n5KanjiData.items || [];
  }
}

/**
 * Get kanji for a specific lesson
 */
export function getKanjiForLesson(level: string, lesson: string | number, lessonSize: number = 5): KanjiItem[] {
  const allKanji = getKanjiData(level);
  const lessonNumber = typeof lesson === 'string' ? parseInt(lesson) : lesson;
  
  const startIndex = (lessonNumber - 1) * lessonSize;
  const endIndex = startIndex + lessonSize;
  
  return allKanji.slice(startIndex, endIndex);
}

/**
 * Convert KanjiItem to WritingQuestion
 */
export function kanjiItemToWritingQuestion(item: KanjiItem): WritingQuestion {
  return {
    kanji: item.character,
    reading: item.readings?.kun?.[0]?.furigana || item.readings?.on?.[0]?.furigana || '',
    meaning: item.meanings?.id || item.meanings?.en || '',
    audio: undefined // No audio in current JSON structure
  };
}

/**
 * Get writing questions for a specific lesson
 */
export function getWritingQuestions(level: string, lesson: string | number, lessonSize: number = 5): WritingQuestion[] {
  const lessonKanji = getKanjiForLesson(level, lesson, lessonSize);
  return lessonKanji.map(kanjiItemToWritingQuestion);
}

/**
 * Get total number of lessons for a level
 */
export function getTotalLessons(level: string, lessonSize: number = 5): number {
  const allKanji = getKanjiData(level);
  return Math.ceil(allKanji.length / lessonSize);
}