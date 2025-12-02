import { VocabularyQuestion, VocabularyExerciseWord } from "../../shared/types";
import { shuffleArray as shuffleArrayUtil } from "@/pwa/features/kanji/exercise/pairing";

/**
 * Generate reading questions from vocabulary words
 */
export function generateReadingQuestions(
  words: VocabularyExerciseWord[],
  questionType: "hiragana-to-meaning" | "kanji-to-meaning" = "kanji-to-meaning",
  language: "id" | "en" = "id"
): VocabularyQuestion[] {
  if (words.length === 0) {
    throw new Error("Need at least 1 word to generate questions");
  }

  const questions = words.map((word, index) => {
    // Get wrong answers from other words (up to 3, or less if not enough words)
    const otherWords = words.filter(w => w.id !== word.id);
    const wrongAnswersCount = Math.min(3, otherWords.length);
    const wrongAnswers = getRandomItems(otherWords, wrongAnswersCount).map(w => 
      language === "id" ? w.meanings.id : w.meanings.en
    );
    
    // Create options array with correct answer based on language
    const correctAnswer = language === "id" ? word.meanings.id : word.meanings.en;
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);

    // Set display properties based on question type
    let japanese: string;
    let hiragana: string | undefined;
    
    if (questionType === "kanji-to-meaning") {
      japanese = word.kanji || word.hiragana;
      hiragana = word.kanji ? word.hiragana : undefined;
    } else {
      japanese = word.hiragana;
      hiragana = undefined;
    }

    return {
      id: index + 1,
      word,
      japanese,
      hiragana,
      options,
      correctAnswer,
      questionType,
    };
  });

  // Shuffle questions before returning
  return shuffleArrayUtil(questions);
}

/**
 * Calculate score based on correct answers
 */
export function calculateScore(correctQuestions: VocabularyQuestion[], totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return (correctQuestions.length / totalQuestions) * 100;
}

/**
 * Check if answer is correct
 */
export function checkAnswer(question: VocabularyQuestion, selectedAnswer: string): boolean {
  return selectedAnswer === question.correctAnswer;
}

/**
 * Get random items from array
 */
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Shuffle array
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Format question number display
 */
export function formatQuestionNumber(current: number, total: number): string {
  return `${current}/${total}`;
}

/**
 * Get progress percentage
 */
export function getProgressPercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return (current / total) * 100;
}