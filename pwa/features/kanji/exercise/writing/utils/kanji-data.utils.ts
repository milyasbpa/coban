// Utility functions for loading kanji data
import { KanjiService, KanjiDetail, KanjiExample } from "@/pwa/core/services/kanji";

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
): KanjiExample[] {
  const questions: KanjiExample[] = [];

  if (topicId) {
    // Use KanjiDetail approach for topic-based questions
    let allKanjiDetails: KanjiDetail[];
    allKanjiDetails = KanjiService.getKanjiDetailsByTopicId(topicId, level);

    // Filter kanji details if selectedKanjiIds is provided
    const kanjiDetails =
      selectedKanjiIds && selectedKanjiIds.length > 0
        ? allKanjiDetails.filter((kanji) => selectedKanjiIds.includes(kanji.id))
        : allKanjiDetails;

    // Collect all examples from all kanji details
    kanjiDetails.forEach((kanjiDetail) => {
      kanjiDetail.examples.forEach((example) => {
        questions.push(example);
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

    // Collect all examples from all kanji items (no limit - get all words)
    kanjiItems.forEach((kanjiItem) => {
      kanjiItem.examples.forEach((example) => {
        questions.push(example);
      });
    });
  }

  return questions;
}

/**
 * Get total number of lessons for a level
 */
export function getTotalLessons(level: string, lessonSize: number = 5): number {
  const allKanji = getAllKanjiByLevel(level);
  return Math.ceil(allKanji.length / lessonSize);
}
