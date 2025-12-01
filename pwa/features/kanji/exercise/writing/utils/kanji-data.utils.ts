// Utility functions for loading kanji data
import { KanjiService, KanjiDetail, KanjiExample } from "@/pwa/core/services/kanji";
import { shuffleArray } from "../../pairing/utils/pairing-game";

// Independent interface (not extends) - following pairing pattern
export interface WritingQuestion {
  id: string;           // Composite ID: "kanjiId-exampleId"
  kanjiId: number;      // Parent kanji ID for scoring
  exampleId: number;    // Original example ID for Firestore
  word: string;
  furigana: string;
  romanji: string;
  meanings: {
    id: string;
    en: string;
  };
}

/**
 * Get all kanji details for a specific level using KanjiService
 */
export function getAllKanjiByLevel(level: string): KanjiDetail[] {
  return KanjiService.getAllKanjiByLevel(level);
}

/**
 * Get kanji for a specific lesson using KanjiService
 */
export function getKanjiForLesson(
  level: string,
  lesson: string | number
): KanjiDetail[] {
  const lessonNumber = typeof lesson === "string" ? parseInt(lesson) : lesson;
  return KanjiService.getKanjiDetailsByLessonId(lessonNumber, level);
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
  const questions: WritingQuestion[] = [];

  if (topicId) {
    // Use KanjiDetail approach for topic-based questions
    let allKanjiDetails: KanjiDetail[];
    allKanjiDetails = KanjiService.getKanjiDetailsByTopicId(topicId, level);

    // Filter kanji details if selectedKanjiIds is provided
    const kanjiDetails =
      selectedKanjiIds && selectedKanjiIds.length > 0
        ? allKanjiDetails.filter((kanji) => selectedKanjiIds.includes(kanji.id))
        : allKanjiDetails;

    // Collect all examples from all kanji details with kanjiId context
    kanjiDetails.forEach((kanjiDetail) => {
      kanjiDetail.examples.forEach((example) => {
        questions.push({
          id: `${kanjiDetail.id}-${example.id}`,  // Composite ID
          kanjiId: kanjiDetail.id,  // Parent kanji ID
          exampleId: example.id,  // Original example ID for Firestore
          word: example.word,
          furigana: example.furigana,
          romanji: example.romanji,
          meanings: example.meanings,
        });
      });
    });
  } else if (lessonId) {
    // Use KanjiDetail approach for lesson-based questions - get all words from lesson kanji
    const allKanjiItems = getKanjiForLesson(level, lessonId);

    // Filter kanji items if selectedKanjiIds is provided
    const kanjiItems =
      selectedKanjiIds && selectedKanjiIds.length > 0
        ? allKanjiItems.filter((kanji) => selectedKanjiIds.includes(kanji.id))
        : allKanjiItems;

    // Collect all examples from all kanji items with kanjiId context
    kanjiItems.forEach((kanjiItem) => {
      kanjiItem.examples.forEach((example) => {
        questions.push({
          id: `${kanjiItem.id}-${example.id}`,  // Composite ID
          kanjiId: kanjiItem.id,  // Parent kanji ID
          exampleId: example.id,  // Original example ID for Firestore
          word: example.word,
          furigana: example.furigana,
          romanji: example.romanji,
          meanings: example.meanings,
        });
      });
    });
  }

  // Shuffle questions before returning
  return shuffleArray(questions);
}

/**
 * Get total number of lessons for a level
 */
export function getTotalLessons(level: string, lessonSize: number = 5): number {
  const allKanji = getAllKanjiByLevel(level);
  return Math.ceil(allKanji.length / lessonSize);
}
