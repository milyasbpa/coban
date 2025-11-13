import { KanjiService } from "@/pwa/core/services/kanji";
import type { KanjiExerciseResult } from "@/pwa/features/score/model/score";
import type { PairingWord } from "../types";

/**
 * Integrate pairing game results with kanji scoring system
 * 
 * @param allGameWords - All words that were played in the game
 * @param globalErrorWords - Set of words that had errors (first-attempt failed)
 * @param level - JLPT level
 * @param updateKanjiMastery - Function to update kanji mastery
 * @param initializeUser - Function to initialize user if needed
 * @param isInitialized - Whether user is already initialized
 * @param currentUserScore - Current user score data
 */
export const integratePairingGameScore = async (
  allGameWords: PairingWord[],
  globalErrorWords: Set<string>,
  level: string,
  updateKanjiMastery: (kanjiId: string, character: string, results: KanjiExerciseResult[]) => Promise<void>,
  initializeUser: (userId: string, level: "N5" | "N4" | "N3" | "N2" | "N1") => Promise<void>,
  isInitialized: boolean,
  currentUserScore: any
) => {
  try {
    // Auto-initialize user if not already initialized
    if (!isInitialized || !currentUserScore) {
      await initializeUser(
        "default-user",
        level as "N5" | "N4" | "N3" | "N2" | "N1"
      );
    }

    // Get final results from store
    const exerciseResults: KanjiExerciseResult[] = [];
    
    // Process all game words and determine first-attempt accuracy
    allGameWords.forEach((word) => {
      // Extract kanji character from the word
      const kanjiCharacter = word.kanji.charAt(0);

      // Get accurate kanji information using the extracted kanji character
      const kanjiInfo = KanjiService.getKanjiInfoForScoring(
        kanjiCharacter,
        level
      );

      // Generate simple word ID
      const wordId = `${kanjiInfo.kanjiId}_${word.id}`;

      // Determine if this word was correct on first attempt
      // If word is NOT in globalErrorWords, it means it was answered correctly on first attempt
      const isCorrectFirstAttempt = !globalErrorWords.has(word.kanji);

      const exerciseResult: KanjiExerciseResult = {
        kanjiId: kanjiInfo.kanjiId,
        kanji: kanjiCharacter,
        isCorrect: isCorrectFirstAttempt,
        wordId,
        word: word.kanji,
        exerciseType: "pairing" as const,
      };

      exerciseResults.push(exerciseResult);
    });

    // Group results by kanji for batch update
    const resultsByKanji = exerciseResults.reduce((acc, result) => {
      if (!acc[result.kanjiId]) {
        acc[result.kanjiId] = [];
      }
      acc[result.kanjiId].push(result);
      return acc;
    }, {} as Record<string, KanjiExerciseResult[]>);

    // Update kanji mastery for each kanji
    for (const [kanjiId, results] of Object.entries(resultsByKanji)) {
      const kanjiCharacter = results[0].kanji;
      await updateKanjiMastery(kanjiId, kanjiCharacter, results);
    }

    console.log(`✅ Successfully integrated pairing game score for ${allGameWords.length} words`);
    
  } catch (error) {
    console.error("❌ Error in pairing game score integration:", error);
    throw error;
  }
};

/**
 * Helper function to determine first-attempt success rate
 */
export const calculateFirstAttemptStats = (
  allGameWords: PairingWord[],
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