import { KanjiService } from "@/pwa/core/services/kanji";
import type { KanjiExerciseResult } from "@/pwa/features/score/model/kanji-score";
import type { PairingWord } from "../types";

/**
 * Integrate pairing game results with kanji scoring system
 *
 * @param allGameWords - All words that were played in the game
 * @param globalErrorWords - Set of words that had errors (first-attempt failed)
 * @param level - JLPT level
 * @param userId - Firebase Auth user ID
 * @param updateKanjiMastery - Function to update kanji mastery
 * @param initializeUser - Function to initialize user if needed
 * @param isInitialized - Whether user is already initialized
 * @param currentUserScore - Current user score data
 */
export const integratePairingGameScore = async (
  allGameWords: PairingWord[],
  globalErrorWords: Set<string>,
  level: string,
  userId: string,
  updateKanjiMastery: (
    kanjiId: string,
    character: string,
    results: KanjiExerciseResult[]
  ) => Promise<void>,
  initializeUser: (
    userId: string,
    level: "N5" | "N4" | "N3" | "N2" | "N1"
  ) => Promise<void>,
  isInitialized: boolean,
  currentUserScore: any
) => {
  try {
    // Auto-initialize user if not already initialized
    if (!isInitialized || !currentUserScore) {
      await initializeUser(userId, level as "N5" | "N4" | "N3" | "N2" | "N1");
    }

    // Get final results from store
    const exerciseResults: KanjiExerciseResult[] = [];

    // Process all game words and determine first-attempt accuracy
    allGameWords.forEach((word) => {
      // Get accurate kanji information using kanjiId (direct lookup - more reliable)
      const kanjiInfo = KanjiService.getKanjiInfoById(word.kanjiId, level);

      // Use example ID for Firestore (word.id from KanjiExample)
      const wordId = word.id.toString();

      // Determine if this word was correct on first attempt
      // If word is NOT in globalErrorWords, it means it was answered correctly on first attempt
      const isCorrectFirstAttempt = !globalErrorWords.has(word.word);

      const exerciseResult: KanjiExerciseResult = {
        kanjiId: kanjiInfo.kanjiId,
        kanji: kanjiInfo.kanjiCharacter,
        isCorrect: isCorrectFirstAttempt,
        wordId,
        word: word.word, // Changed from word.kanji to word.word
        exerciseType: "pairing" as const,
        level: level as "N5" | "N4" | "N3" | "N2" | "N1", // Level from exercise context
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
    firstAttemptAccuracy: Math.round(
      (correctFirstAttemptCount / totalWords) * 100
    ),
  };
};
