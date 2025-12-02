// Utility functions for loading kanji data
import { KanjiService, KanjiDetail, KanjiExample } from "@/pwa/core/services/kanji";
import { shuffleArray } from "../../pairing/utils/pairing-game";

// Independent interface extending KanjiExample - following pairing pattern
export interface WritingQuestion extends KanjiExample {
  kanjiId: number;      // Parent kanji ID for scoring
}

// Helper function to get composite ID for UI keys
export const getCompositeId = (question: WritingQuestion): string => {
  return `${question.kanjiId}-${question.id}`;
};

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
): { questions: WritingQuestion[]; allQuestionsForDistractors?: WritingQuestion[] } {
  const allQuestions: WritingQuestion[] = [];
  const selectedQuestions: WritingQuestion[] = [];

  if (topicId) {
    // Use KanjiDetail approach for topic-based questions
    const allKanjiDetails = KanjiService.getKanjiDetailsByTopicId(topicId, level);

    // Collect all questions from all kanji in topic
    allKanjiDetails.forEach((kanjiDetail) => {
      kanjiDetail.examples.forEach((example) => {
        allQuestions.push({
          ...example,
          kanjiId: kanjiDetail.id,
        });
      });
    });

    // Filter for selected kanji if provided
    if (selectedKanjiIds && selectedKanjiIds.length > 0) {
      const selectedKanjiDetails = allKanjiDetails.filter((kanji) =>
        selectedKanjiIds.includes(kanji.id)
      );

      selectedKanjiDetails.forEach((kanjiDetail) => {
        kanjiDetail.examples.forEach((example) => {
          selectedQuestions.push({
            ...example,
            kanjiId: kanjiDetail.id,
          });
        });
      });

      return {
        questions: shuffleArray(selectedQuestions),
        allQuestionsForDistractors: allQuestions,
      };
    }

    return { questions: shuffleArray(allQuestions) };
  } else if (lessonId) {
    // Use KanjiDetail approach for lesson-based questions
    const allKanjiItems = getKanjiForLesson(level, lessonId);

    // Collect all questions from all kanji in lesson
    allKanjiItems.forEach((kanjiItem) => {
      kanjiItem.examples.forEach((example) => {
        allQuestions.push({
          ...example,
          kanjiId: kanjiItem.id,
        });
      });
    });

    // Filter for selected kanji if provided
    if (selectedKanjiIds && selectedKanjiIds.length > 0) {
      const selectedKanjiItems = allKanjiItems.filter((kanji) =>
        selectedKanjiIds.includes(kanji.id)
      );

      selectedKanjiItems.forEach((kanjiItem) => {
        kanjiItem.examples.forEach((example) => {
          selectedQuestions.push({
            ...example,
            kanjiId: kanjiItem.id,
          });
        });
      });

      return {
        questions: shuffleArray(selectedQuestions),
        allQuestionsForDistractors: allQuestions,
      };
    }

    return { questions: shuffleArray(allQuestions) };
  }

  return { questions: [] };
}

/**
 * Get total number of lessons for a level
 */
export function getTotalLessons(level: string, lessonSize: number = 5): number {
  const allKanji = getAllKanjiByLevel(level);
  return Math.ceil(allKanji.length / lessonSize);
}
