import { VocabularyQuestion, VocabularyExerciseWord } from "../../shared/types";

/**
 * Generate reading questions from vocabulary words
 */
export function generateReadingQuestions(
  words: VocabularyExerciseWord[],
  questionType: "hiragana-to-meaning" | "kanji-to-meaning" = "kanji-to-meaning"
): VocabularyQuestion[] {
  if (words.length < 4) {
    throw new Error("Need at least 4 words to generate questions");
  }

  return words.map((word, index) => {
    // Get 3 random wrong answers from other words
    const otherWords = words.filter(w => w.id !== word.id);
    const wrongAnswers = getRandomItems(otherWords, 3).map(w => w.meanings.id);
    
    // Create options array with correct answer
    const correctAnswer = word.meanings.id;
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