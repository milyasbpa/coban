import { VocabularyQuestion } from "../../shared/types";

export interface CharacterTile {
  id: string;
  character: string;
  isUsed: boolean;
}

/**
 * Generate character tiles for the writing exercise
 * Includes correct answer characters + distractor characters from other words
 * 
 * @param currentQuestion - The current question
 * @param allQuestions - All questions in the exercise (to get distractors)
 * @param mode - "hiragana" or "kanji"
 * @param minDistractors - Minimum number of distractor characters (default: 6)
 */
export const generateCharacterTiles = (
  currentQuestion: VocabularyQuestion,
  allQuestions: VocabularyQuestion[],
  mode: "hiragana" | "kanji",
  minDistractors: number = 6
): CharacterTile[] => {
  // Get correct answer based on mode
  const correctAnswer = mode === "kanji" 
    ? (currentQuestion.word.kanji || currentQuestion.word.hiragana)
    : currentQuestion.word.hiragana;

  // Split correct answer into individual characters
  const correctCharacters = correctAnswer.split("");

  // Create tiles for correct characters
  const correctTiles: CharacterTile[] = correctCharacters.map((char, index) => ({
    id: `correct-${index}-${char}`,
    character: char,
    isUsed: false,
  }));

  // Get distractor characters from other questions
  const distractorCharacters: string[] = [];
  const otherQuestions = allQuestions.filter(q => q.id !== currentQuestion.id);

  for (const question of otherQuestions) {
    if (distractorCharacters.length >= minDistractors) break;

    const otherWord = mode === "kanji"
      ? (question.word.kanji || question.word.hiragana)
      : question.word.hiragana;

    // Add characters from this word (avoid duplicates with correct answer)
    const chars = otherWord.split("").filter(char => 
      !correctCharacters.includes(char) && 
      !distractorCharacters.includes(char)
    );

    distractorCharacters.push(...chars);
  }

  // Limit distractors to minDistractors count
  const limitedDistractors = distractorCharacters.slice(0, minDistractors);

  // Create tiles for distractor characters
  const distractorTiles: CharacterTile[] = limitedDistractors.map((char, index) => ({
    id: `distractor-${index}-${char}`,
    character: char,
    isUsed: false,
  }));

  // Combine and shuffle all tiles
  const allTiles = [...correctTiles, ...distractorTiles];
  
  // Fisher-Yates shuffle algorithm
  for (let i = allTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
  }

  return allTiles;
};

/**
 * Check if the selected characters form the correct answer
 */
export const checkTileAnswer = (
  selectedCharacters: string[],
  correctAnswer: string
): boolean => {
  return selectedCharacters.join("") === correctAnswer;
};

/**
 * Get the expected answer based on mode
 */
export const getExpectedTileAnswer = (
  question: VocabularyQuestion,
  mode: "hiragana" | "kanji"
): string => {
  return mode === "kanji"
    ? (question.word.kanji || question.word.hiragana)
    : question.word.hiragana;
};
