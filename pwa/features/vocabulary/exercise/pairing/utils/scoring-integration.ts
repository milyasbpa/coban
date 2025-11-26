import { VocabularyService } from "@/pwa/core/services/vocabulary";
import type { VocabularyExerciseResult } from "@/pwa/features/score/model/vocabulary-score";
import type { VocabularyPairingWord } from "../store/vocabulary-pairing-exercise.store";
import { VocabularyStorageManager } from "@/pwa/features/score/storage/vocabulary-storage";
import { VocabularyScoreCalculator } from "@/pwa/features/score/utils/vocabulary-score-calculator";

/**
 * Integrate vocabulary pairing game results with vocabulary scoring system
 * 
 * @param allGameWords - All words that were played in the game
 * @param globalErrorWords - Set of words that had errors (first-attempt failed)
 * @param level - JLPT level
 * @param categoryId - Vocabulary category ID
 */
export const integrateVocabularyPairingGameScore = async (
  allGameWords: VocabularyPairingWord[],
  globalErrorWords: Set<string>,
  level: string,
  categoryId: string
) => {
  try {
    // Initialize user score if needed
    const userId = "default-user";
    let userScore = await VocabularyStorageManager.getVocabularyScore(userId);

    if (!userScore) {
      userScore = await VocabularyStorageManager.createDefaultVocabularyScore(
        userId,
        level as "N5" | "N4" | "N3" | "N2" | "N1"
      );
    }

    // Process all game words and determine first-attempt accuracy
    const exerciseResults: VocabularyExerciseResult[] = [];
    
    allGameWords.forEach((word) => {
      // Determine if this word was correct on first attempt
      const identifierKey = word.kanji || word.hiragana;
      const isCorrectFirstAttempt = !globalErrorWords.has(identifierKey);

      const exerciseResult: VocabularyExerciseResult = {
        vocabularyId: word.id.toString(),
        kanji: word.kanji || "",
        hiragana: word.hiragana,
        romaji: word.romaji || "",
        categoryId: categoryId, // ✅ Save categoryId from game
        isCorrect: isCorrectFirstAttempt,
        exerciseType: "pairing" as const,
        level: level as "N5" | "N4" | "N3" | "N2" | "N1",
      };

      exerciseResults.push(exerciseResult);
    });

    // Update mastery for each vocabulary word
    await VocabularyStorageManager.saveExerciseResults(userId, exerciseResults);

    console.log(`✅ Successfully integrated vocabulary pairing game score for ${allGameWords.length} words`);
    
  } catch (error) {
    console.error("❌ Error in vocabulary pairing game score integration:", error);
    throw error;
  }
};

/**
 * Helper function to determine first-attempt success rate
 */
export const calculateVocabularyFirstAttemptStats = (
  allGameWords: VocabularyPairingWord[],
  globalErrorWords: Set<string>
) => {
  const totalWords = allGameWords.length;
  const errorWordsCount = globalErrorWords.size;
  const correctFirstAttemptCount = totalWords - errorWordsCount;
  
  return {
    totalWords,
    correctFirstAttemptCount,
    errorWordsCount,
    firstAttemptAccuracy: Math.round((correctFirstAttemptCount / totalWords) * 100)
  };
};
