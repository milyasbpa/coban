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
    // Create wrong options from other examples
    const wrongOptions = allOptions
      .filter((_, i) => i !== index)
      .filter((opt) => opt.furigana !== correctOption.furigana)
      .slice(0, 3); // Take 3 wrong options

    // Ensure we have enough options, if not, pad with some random examples
    while (wrongOptions.length < 3 && allOptions.length > 1) {
      const randomOption =
        allOptions[Math.floor(Math.random() * allOptions.length)];
      if (
        randomOption.furigana !== correctOption.furigana &&
        !wrongOptions.some((opt) => opt.furigana === randomOption.furigana)
      ) {
        wrongOptions.push(randomOption);
      }
      if (wrongOptions.length >= 3) break;
    }

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
