import {
  KanjiService,
  KanjiDetail,
  KanjiExample,
} from "@/pwa/core/services/kanji";
import { shuffleArray } from "../../pairing/utils";

export interface ReadingQuestion {
  id: string;
  question: KanjiExample;    // Rich data structure for the question
  options: KanjiExample[];   // Rich options for future flexibility
}

export interface AnswerResult {
  selectedAnswer: KanjiExample;  // What user selected
  userAnswer: string;            // User input for direct input mode
}

// Convert kanji examples (words) to reading questions
export const createReadingQuestions = (
  kanjiDetails: KanjiDetail[]
): ReadingQuestion[] => {
  const questions: ReadingQuestion[] = [];
  const examples: KanjiExample[] = [];

  // Collect all examples from all kanji and convert to KanjiExample format
  kanjiDetails.forEach((kanji) => {
    kanji.examples.forEach((kanjiExample) => {
      examples.push({
        id: kanjiExample.id,
        word: kanjiExample.word,
        furigana: kanjiExample.furigana,
        romanji: kanjiExample.romanji,
        meanings: kanjiExample.meanings
      });
    });
  });

  // Create questions from examples (words), not individual kanji
  examples.forEach((example, index) => {
    // Create wrong options from other examples
    const wrongOptions = examples
      .filter((_, i) => i !== index)
      .filter((ex) => ex.furigana !== example.furigana)
      .slice(0, 3); // Take 3 wrong options

    // Ensure we have enough options, if not, pad with some random examples
    while (wrongOptions.length < 3 && examples.length > 1) {
      const randomExample = examples[Math.floor(Math.random() * examples.length)];
      if (
        randomExample.furigana !== example.furigana &&
        !wrongOptions.some(opt => opt.furigana === randomExample.furigana)
      ) {
        wrongOptions.push(randomExample);
      }
      if (wrongOptions.length >= 3) break;
    }

    // Combine correct answer with wrong options and shuffle
    const allOptions = [example, ...wrongOptions];
    const options = shuffleArray(allOptions);

    // Push the question to questions array
    questions.push({
      id: `example-${index}`,
      question: example,    // The KanjiExample being asked about
      options,              // Array of KanjiExample options
    });
  });

  return questions;
};

// Check if answer is correct
export const checkAnswer = (
  question: ReadingQuestion,
  selectedOption: KanjiExample,
  userAnswer: string = ""
): AnswerResult => {
  return {
    selectedAnswer: selectedOption,
    userAnswer: userAnswer,
  };
};

// Helper function to check if answer is correct (for computed logic)
export const isAnswerCorrect = (
  question: ReadingQuestion,
  selectedOption: KanjiExample
): boolean => {
  return selectedOption.furigana.toLowerCase().trim() === 
         question.question.furigana.toLowerCase().trim();
};

// Calculate final score
export const calculateReadingScore = (correctQuestions: ReadingQuestion[], totalQuestions: number): number => {
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
  const kanjiDetails = selectedKanjiIds && selectedKanjiIds.length > 0
    ? allKanjiDetails.filter(kanji => selectedKanjiIds.includes(kanji.id))
    : allKanjiDetails;
    
  const questions = createReadingQuestions(kanjiDetails);

  return {
    questions,
  };
};
