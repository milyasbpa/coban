import { KanjiService } from "@/pwa/core/services/kanji";
import type { KanjiExerciseResult } from "@/pwa/features/score/model/kanji-score";
import type { KanjiExample } from "@/pwa/core/services/kanji";

/**
 * Integrate writing exercise results with kanji scoring system
 * 
 * @param allQuestions - All questions that were played in the game
 * @param wrongQuestions - Questions that had errors (first-attempt failed)
 * @param level - JLPT level
 * @param userId - Firebase Auth user ID
 * @param updateKanjiMastery - Function to update kanji mastery
 * @param initializeUser - Function to initialize user if needed
 * @param isInitialized - Whether user is already initialized
 * @param currentUserScore - Current user score data
 */
export const integrateWritingGameScore = async (
  allQuestions: KanjiExample[],
  wrongQuestions: KanjiExample[],
  level: string,
  userId: string,
  updateKanjiMastery: (kanjiId: string, character: string, results: KanjiExerciseResult[]) => Promise<void>,
  initializeUser: (userId: string, level: "N5" | "N4" | "N3" | "N2" | "N1") => Promise<void>,
  isInitialized: boolean,
  currentUserScore: any
) => {
  try {
    // Auto-initialize user if not already initialized
    if (!isInitialized || !currentUserScore) {
      await initializeUser(
        userId,
        level as "N5" | "N4" | "N3" | "N2" | "N1"
      );
    }

    // Convert wrongQuestions array to Set for easier lookup by word
    const errorWords = new Set(wrongQuestions.map(q => q.word));

    // Get final results from store
    const exerciseResults: KanjiExerciseResult[] = [];
    
    // Process all questions and determine first-attempt accuracy
    allQuestions.forEach((question) => {
      // Extract kanji character from the question word
      const kanjiCharacter = question.word.charAt(0);

      // Get accurate kanji information using the extracted kanji character
      const kanjiInfo = KanjiService.getKanjiInfoForScoring(
        kanjiCharacter,
        level
      );

      // Generate simple word ID
      const wordId = `${kanjiInfo.kanjiId}_${question.word}`;

      // Determine if this question was correct on first attempt
      // If question word is NOT in errorWords, it means it was answered correctly on first attempt
      const isCorrectFirstAttempt = !errorWords.has(question.word);

      const exerciseResult: KanjiExerciseResult = {
        kanjiId: kanjiInfo.kanjiId,
        kanji: kanjiCharacter,
        isCorrect: isCorrectFirstAttempt,
        wordId,
        word: question.word,
        exerciseType: "writing" as const,
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

    console.log(`✅ Successfully integrated writing game score for ${allQuestions.length} questions`);
    
  } catch (error) {
    console.error("❌ Error in writing game score integration:", error);
    throw error;
  }
};

/**
 * Helper function to determine first-attempt success rate
 */
export const calculateFirstAttemptStats = (
  allQuestions: KanjiExample[],
  wrongQuestions: KanjiExample[]
) => {
  const totalQuestions = allQuestions.length;
  const errorQuestionsCount = wrongQuestions.length;
  const correctFirstAttemptCount = totalQuestions - errorQuestionsCount;
  
  return {
    totalQuestions,
    correctFirstAttemptCount,
    errorQuestionsCount,
    firstAttemptAccuracy: Math.round((correctFirstAttemptCount / totalQuestions) * 100)
  };
};