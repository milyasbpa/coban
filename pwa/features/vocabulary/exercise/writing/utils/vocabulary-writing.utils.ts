import { VocabularyQuestion, VocabularyExerciseWord } from "../../shared/types";
import { shuffleArray } from "@/pwa/features/kanji/exercise/pairing";

/**
 * Generate writing questions from vocabulary words
 */
export function generateWritingQuestions(
  words: VocabularyExerciseWord[],
  questionType: "meaning-to-romaji" | "meaning-to-hiragana" | "meaning-to-kanji" = "meaning-to-romaji"
): VocabularyQuestion[] {
  const questions = words.map((word, index) => {
    // Set correct answer based on question type
    let correctAnswer: string;
    let japanese: string;
    
    switch (questionType) {
      case "meaning-to-romaji":
        correctAnswer = word.romaji;
        japanese = word.meanings.id;
        break;
      case "meaning-to-hiragana":
        correctAnswer = word.hiragana;
        japanese = word.meanings.id;
        break;
      case "meaning-to-kanji":
        correctAnswer = word.kanji || word.hiragana;
        japanese = word.meanings.id;
        break;
      default:
        correctAnswer = word.romaji;
        japanese = word.meanings.id;
    }

    return {
      id: index + 1,
      word,
      japanese,
      hiragana: word.hiragana,
      options: [], // Not used in writing exercise
      correctAnswer,
      questionType,
    };
  });

  // Shuffle questions to randomize order
  return shuffleArray(questions);
}

/**
 * Check if written answer is correct
 */
export function checkWritingAnswer(
  question: VocabularyQuestion, 
  userInput: string, 
  inputMode: "romaji" | "hiragana" | "kanji"
): boolean {
  const trimmedInput = userInput.trim().toLowerCase();
  
  switch (inputMode) {
    case "romaji":
      return trimmedInput === question.word.romaji.toLowerCase();
    case "hiragana":
      return trimmedInput === question.word.hiragana;
    case "kanji":
      const expectedKanji = question.word.kanji || question.word.hiragana;
      return trimmedInput === expectedKanji.toLowerCase();
    default:
      return false;
  }
}

/**
 * Calculate score based on correct answers
 */
export function calculateScore(correctQuestions: VocabularyQuestion[], totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return (correctQuestions.length / totalQuestions) * 100;
}

/**
 * Get expected answer based on input mode
 */
export function getExpectedAnswer(question: VocabularyQuestion, inputMode: "romaji" | "hiragana" | "kanji"): string {
  switch (inputMode) {
    case "romaji":
      return question.word.romaji;
    case "hiragana":
      return question.word.hiragana;
    case "kanji":
      return question.word.kanji || question.word.hiragana;
    default:
      return question.word.romaji;
  }
}

/**
 * Normalize input for comparison (remove extra spaces, convert to lowercase for romaji)
 */
export function normalizeInput(input: string, inputMode: "romaji" | "hiragana" | "kanji"): string {
  const trimmed = input.trim();
  return inputMode === "romaji" ? trimmed.toLowerCase() : trimmed;
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