import {
  getKanjiDetailsByLessonId,
  KanjiDetail,
} from "@/pwa/features/kanji/lesson/utils/kanji";

export interface ReadingQuestion {
  id: string;
  kanji: string;
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

// Convert kanji to reading questions
export const createReadingQuestions = (
  kanjiDetails: KanjiDetail[]
): ReadingQuestion[] => {
  const questions: ReadingQuestion[] = [];

  kanjiDetails.forEach((kanji, index) => {
    // Get all possible readings for options
    const allReadings = [
      ...kanji.readings.kun.map((r) => r.furigana),
      ...kanji.readings.on.map((r) => r.furigana),
    ];

    // Pick the first kun reading as correct answer (or on if no kun)
    const correctReading =
      kanji.readings.kun.length > 0
        ? kanji.readings.kun[0].furigana
        : kanji.readings.on[0].furigana;

    const correctFurigana =
      kanji.readings.kun.length > 0
        ? kanji.readings.kun[0].furigana
        : kanji.readings.on[0].furigana;

    // Create wrong options from other kanji readings
    const wrongOptions = kanjiDetails
      .filter((_, i) => i !== index)
      .flatMap((k) => [
        ...k.readings.kun.map((r) => r.furigana),
        ...k.readings.on.map((r) => r.furigana),
      ])
      .filter((reading) => reading !== correctReading)
      .slice(0, 3); // Take 3 wrong options

    // Shuffle options
    const options = shuffleArray([correctReading, ...wrongOptions]);

    questions.push({
      id: `${kanji.id}-${index}`,
      kanji: kanji.character,
      correctReading,
      correctMeaning: kanji.meanings.id,
      furigana: correctFurigana,
      options,
    });
  });

  return questions;
};

// Shuffle array utility
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

// Get reading game data by lesson
export const getReadingGameData = (lessonId: number, level: string) => {
  const kanjiDetails = getKanjiDetailsByLessonId(lessonId, level);
  const questions = createReadingQuestions(kanjiDetails);

  return {
    questions,
    totalQuestions: questions.length,
  };
};
