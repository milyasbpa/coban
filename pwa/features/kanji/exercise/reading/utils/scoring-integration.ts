import { KanjiService } from "@/pwa/core/services/kanji";
import type { KanjiExerciseResult } from "@/pwa/features/score/model/kanji-score";
import type { ReadingQuestion } from "./reading-game";
import { getCompositeId } from "./reading-game";

/**
 * Integrate reading exercise results with kanji scoring system
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
export const integrateReadingGameScore = async (
  allQuestions: ReadingQuestion[],
  wrongQuestions: ReadingQuestion[],
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

    // Convert wrongQuestions array to Set for easier lookup by word
    const errorWords = new Set(wrongQuestions.map((q) => q.word));

    // Get final results from store
    const exerciseResults: KanjiExerciseResult[] = [];

    console.log('🔍 [Reading Score Integration] Processing questions:', {
      totalQuestions: allQuestions.length,
      level,
    });

    // Process all questions and determine first-attempt accuracy
    allQuestions.forEach((question) => {
      // Get accurate kanji information using kanjiId (direct lookup - more reliable)
      const kanjiInfo = KanjiService.getKanjiInfoById(question.kanjiId, level);

      console.log(`  📝 Question: ${question.word} (ID: ${question.id})`, {
        kanjiId: question.kanjiId,
        readingType: question.readingType,
        kanjiInfo,
      });

      // Use composite ID for Firestore to ensure uniqueness across kun/on/exception readings
      // Format: kanjiId-readingType-readingId-exampleId (e.g., "1-kun-1-1", "1-on-2-1")
      const wordId = getCompositeId(question);

      console.log(`    ✅ Using composite wordId: ${wordId}`);

      // Determine if this question was correct on first attempt
      // If question word is NOT in errorWords, it means it was answered correctly on first attempt
      const isCorrectFirstAttempt = !errorWords.has(question.word);

      const exerciseResult: KanjiExerciseResult = {
        kanjiId: kanjiInfo.kanjiId,
        kanji: kanjiInfo.kanjiCharacter,
        isCorrect: isCorrectFirstAttempt,
        wordId,
        word: question.word,
        exerciseType: "reading" as const,
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

    console.log('📊 [Reading Score Integration] Results by Kanji:', {
      kanjiCount: Object.keys(resultsByKanji).length,
      totalResults: exerciseResults.length,
      details: Object.entries(resultsByKanji).map(([kanjiId, results]) => ({
        kanjiId,
        character: results[0].kanji,
        wordsCount: results.length,
        words: results.map(r => `${r.word}(${r.isCorrect ? '✅' : '❌'})`),
      })),
    });

    // Update kanji mastery for each kanji
    for (const [kanjiId, results] of Object.entries(resultsByKanji)) {
      const kanjiCharacter = results[0].kanji;
      console.log(`💾 Saving ${results.length} words for Kanji ${kanjiCharacter} (ID: ${kanjiId})`);
      await updateKanjiMastery(kanjiId, kanjiCharacter, results);
    }
  } catch (error) {
    console.error("❌ Error in reading game score integration:", error);
    throw error;
  }
};

/**
 * Helper function to determine first-attempt success rate
 */
export const calculateFirstAttemptStats = (
  allQuestions: ReadingQuestion[],
  wrongQuestions: ReadingQuestion[]
) => {
  const totalQuestions = allQuestions.length;
  const errorQuestionsCount = wrongQuestions.length;
  const correctFirstAttemptCount = totalQuestions - errorQuestionsCount;

  return {
    totalQuestions,
    correctFirstAttemptCount,
    errorQuestionsCount,
    firstAttemptAccuracy: Math.round(
      (correctFirstAttemptCount / totalQuestions) * 100
    ),
  };
};
