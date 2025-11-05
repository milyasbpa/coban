// Utility functions for loading kanji data
import n5KanjiData from "@/data/n5/kanji/kanji.json";
import {
  KanjiService,
  KanjiDetail,
} from "@/pwa/core/services/kanji";

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
    id: number;
    word: string;
    furigana: string;
    romanji: string;
    meanings: {
      id: string;
      en: string;
    };
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
  console.log("getKanjiData called with level:", level);
  switch (level.toLowerCase()) {
    case "n5":
      console.log("N5 data items count:", n5KanjiData.items?.length || 0);
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
export function getKanjiForLesson(
  level: string,
  lesson: string | number,
  lessonSize: number = 5
): KanjiItem[] {
  const allKanji = getKanjiData(level);
  const lessonNumber = typeof lesson === "string" ? parseInt(lesson) : lesson;

  const startIndex = (lessonNumber - 1) * lessonSize;
  const endIndex = startIndex + lessonSize;

  console.log("getKanjiForLesson:", { level, lessonNumber, startIndex, endIndex, totalKanji: allKanji.length });
  const result = allKanji.slice(startIndex, endIndex);
  console.log("getKanjiForLesson result:", result.map(k => ({ id: k.id, character: k.character, examplesCount: k.examples?.length || 0 })));
  
  return result;
}

/**
 * Convert KanjiItem example to WritingQuestion
 */
export function kanjiExampleToWritingQuestion(example: NonNullable<KanjiItem['examples']>[0]): WritingQuestion {
  return {
    kanji: example.word, // Use the word/phrase, not individual kanji
    reading: example.furigana,
    meaning: example.meanings.id, // Use new meanings structure
    audio: undefined, // No audio in current JSON structure
  };
}

/**
 * Convert KanjiDetail example to WritingQuestion (for topic-based questions)
 */
export function kanjiDetailExampleToWritingQuestion(example: KanjiDetail['examples'][0]): WritingQuestion {
  return {
    kanji: example.word, // Use the word/phrase, not individual kanji
    reading: example.furigana,
    meaning: example.meanings.id, // Use new meanings structure
    audio: undefined, // No audio in current JSON structure
  };
}

/**
 * Get writing questions for a specific lesson or topic - based on examples (words), not individual kanji
 */
export function getWritingQuestions(
  level: string,
  lessonId: number | null,
  selectedKanjiIds?: number[],
  topicId?: string
): WritingQuestion[] {
  console.log("getWritingQuestions called with:", { level, lessonId, selectedKanjiIds, topicId });
  const questions: WritingQuestion[] = [];
  
  if (topicId) {
    // Use KanjiDetail approach for topic-based questions
    let allKanjiDetails: KanjiDetail[];
    allKanjiDetails = KanjiService.getKanjiDetailsByTopicId(topicId, level);
    
    // Filter kanji details if selectedKanjiIds is provided
    const kanjiDetails = selectedKanjiIds && selectedKanjiIds.length > 0
      ? allKanjiDetails.filter(kanji => selectedKanjiIds.includes(kanji.id))
      : allKanjiDetails;
    
    // Collect all examples from all kanji details
    kanjiDetails.forEach(kanjiDetail => {
      kanjiDetail.examples.forEach(example => {
        questions.push(kanjiDetailExampleToWritingQuestion(example));
      });
    });
    
  } else if (lessonId) {
    // Use KanjiItem approach for lesson-based questions (existing logic)
    console.log("Processing lesson-based questions for lessonId:", lessonId);
    const allKanjiItems = getKanjiForLesson(level, lessonId, 5);
    console.log("allKanjiItems:", allKanjiItems.length, "items");
    
    // Filter kanji items if selectedKanjiIds is provided
    const kanjiItems = selectedKanjiIds && selectedKanjiIds.length > 0
      ? allKanjiItems.filter(kanji => selectedKanjiIds.includes(kanji.id))
      : allKanjiItems;
    console.log("kanjiItems after filtering:", kanjiItems.length, "items");
    
    // Collect all examples from all kanji items
    kanjiItems.forEach(kanjiItem => {
      console.log(`Processing kanji ${kanjiItem.character} with ${kanjiItem.examples?.length || 0} examples`);
      if (kanjiItem.examples) {
        kanjiItem.examples.forEach(example => {
          questions.push(kanjiExampleToWritingQuestion(example));
        });
      }
    });
  }
  
  console.log("Final questions count:", questions.length);
  return questions;
}

/**
 * Get total number of lessons for a level
 */
export function getTotalLessons(level: string, lessonSize: number = 5): number {
  const allKanji = getKanjiData(level);
  return Math.ceil(allKanji.length / lessonSize);
}
