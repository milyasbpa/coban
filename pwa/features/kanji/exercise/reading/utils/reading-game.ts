import {
  getKanjiDetailsByLessonId,
  getKanjiDetailsByTopicId,
  KanjiDetail,
} from "@/pwa/features/kanji/lesson/utils/kanji";
import { shuffleArray } from "../../pairing/utils";

export interface ReadingQuestion {
  id: string;
  kanji: string;
  romanji: string;
  correctReading: string;
  correctMeaning: string;
  furigana: string;
  options: string[]; // For multiple choice
}

export interface ReadingGameStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentQuestion: number;
  score: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  kanji: string;
  furigana: string;
  meaning: string;
}

// Convert kanji examples (words) to reading questions
export const createReadingQuestions = (
  kanjiDetails: KanjiDetail[]
): ReadingQuestion[] => {
  const questions: ReadingQuestion[] = [];
  const examples: KanjiDetail["examples"] = [];

  // Collect all examples from all kanji
  kanjiDetails.forEach((kanji) => {
    kanji.examples.forEach((kanjiExample) => {
      examples.push(kanjiExample);
    });
  });

  // Create questions from examples (words), not individual kanji
  examples.forEach((example, index) => {
    const correctReading = example.furigana; // Use furigana from KanjiDetail structure
    const correctRomanji = example.romanji; // Use romanji from KanjiDetail structure
    const correctMeaning = example.meaning_id; // Use meaning_id from KanjiDetail structure

    // Create wrong options from other examples' readings
    const wrongOptions = examples
      .filter((_, i) => i !== index)
      .map((ex) => ex.furigana)
      .filter((reading) => reading !== correctReading)
      .slice(0, 3); // Take 3 wrong options

    // Ensure we have enough options, if not, pad with some default options
    while (wrongOptions.length < 3 && examples.length > 1) {
      const randomExample =
        examples[Math.floor(Math.random() * examples.length)];
      if (
        randomExample.furigana !== correctReading &&
        !wrongOptions.includes(randomExample.furigana)
      ) {
        wrongOptions.push(randomExample.furigana);
      }
      if (wrongOptions.length >= 3) break;
    }

    // Shuffle options
    const options = shuffleArray([correctReading, ...wrongOptions]);

    // Push the question to questions array
    questions.push({
      id: `example-${index}`,
      kanji: example.word, // The word/phrase, not individual kanji
      romanji: example.romanji,
      correctReading,
      correctMeaning,
      furigana: correctReading,
      options,
    });
  });

  return questions;
};

// Check if answer is correct
export const checkAnswer = (
  question: ReadingQuestion,
  userAnswer: string
): AnswerResult => {
  const isCorrect =
    userAnswer.toLowerCase().trim() ===
    question.correctReading.toLowerCase().trim();

  return {
    isCorrect,
    userAnswer,
    correctAnswer: question.correctReading,
    kanji: question.kanji,
    furigana: question.furigana,
    meaning: question.correctMeaning,
  };
};

// Calculate final score
export const calculateReadingScore = (stats: ReadingGameStats): number => {
  if (stats.totalQuestions === 0) return 0;
  return Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
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
    allKanjiDetails = getKanjiDetailsByTopicId(topicId, level);
  } else if (lessonId) {
    // Get kanji details by lesson ID
    allKanjiDetails = getKanjiDetailsByLessonId(lessonId, level);
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
    totalQuestions: questions.length,
  };
};
