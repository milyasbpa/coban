import {
  KanjiService,
  KanjiDetail,
  KanjiExample,
} from "@/pwa/core/services/kanji";
import { shuffleArray } from "../../pairing/utils";

// Independent interface extending KanjiExample - following pairing pattern
export interface ReadingQuestion extends KanjiExample {
  kanjiId: number;      // Parent kanji ID for scoring
  options: ReadingOption[];
}

export interface ReadingOption extends KanjiExample {
  kanjiId: number;      // Parent kanji ID
}

// Helper function to get composite ID for UI keys
export const getCompositeId = (item: ReadingQuestion | ReadingOption): string => {
  return `${item.kanjiId}-${item.id}`;
};

export interface AnswerResult {
  selectedAnswer: ReadingOption; // What user selected
  userAnswer: string; // User input for direct input mode
}

// Convert kanji examples (words) to reading questions
export const createReadingQuestions = (
  kanjiDetails: KanjiDetail[]
): ReadingQuestion[] => {
  const questions: ReadingQuestion[] = [];
  const allOptions: ReadingOption[] = [];

  // Collect all examples as options with kanjiId context
  kanjiDetails.forEach((kanji) => {
    kanji.examples.forEach((example) => {
      allOptions.push({
        ...example,           // Spread all KanjiExample fields
        kanjiId: kanji.id,    // Add parent kanji ID
      });
    });
  });

  // Create questions from options
  allOptions.forEach((correctOption, index) => {
    // Calculate how many unique wrong options are available
    const availableWrongOptions = allOptions.filter(
      (opt, i) => i !== index && opt.furigana !== correctOption.furigana
    );
    
    // Determine target number of wrong options (ideally 3, but adapt to available data)
    const targetWrongOptionsCount = Math.min(3, availableWrongOptions.length);
    
    // Get wrong options (no need for while loop since we know exactly how many we can get)
    const wrongOptions = availableWrongOptions.slice(0, targetWrongOptionsCount);

    // Combine correct answer with wrong options and shuffle
    const combinedOptions = [correctOption, ...wrongOptions];
    const shuffledOptions = shuffleArray(combinedOptions);

    // Create ReadingQuestion - just add options to the correct option
    questions.push({
      ...correctOption,     // Spread KanjiExample + kanjiId
      options: shuffledOptions,
    });
  });

  return questions;
};

// Helper function to check if answer is correct (for computed logic)
export const isAnswerCorrect = (
  question: ReadingQuestion,
  selectedOption: ReadingOption
): boolean => {
  return (
    selectedOption.furigana.toLowerCase().trim() ===
    question.furigana.toLowerCase().trim()
  );
};

// Calculate final score
export const calculateReadingScore = (
  correctQuestions: ReadingQuestion[],
  totalQuestions: number
): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((correctQuestions.length / totalQuestions) * 100);
};

// Get reading game data by lesson or topic
export const getReadingGameData = (
  lessonId: number | null,
  level: string,
  selectedKanjiIds?: number[],
  topicId?: string
) => {
  let allKanjiDetails: KanjiDetail[];

  if (topicId) {
    // Get kanji details by topic ID
    allKanjiDetails = KanjiService.getKanjiDetailsByTopicId(topicId, level);
  } else if (lessonId) {
    // Get kanji details by lesson ID
    allKanjiDetails = KanjiService.getKanjiDetailsByLessonId(lessonId, level);
  } else {
    allKanjiDetails = [];
  }

  // Filter kanji details if selectedKanjiIds is provided
  const kanjiDetails =
    selectedKanjiIds && selectedKanjiIds.length > 0
      ? allKanjiDetails.filter((kanji) => selectedKanjiIds.includes(kanji.id))
      : allKanjiDetails;

  const questions = createReadingQuestions(kanjiDetails);

  return {
    questions,
  };
};
