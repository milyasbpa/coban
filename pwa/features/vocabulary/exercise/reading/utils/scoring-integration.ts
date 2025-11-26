import type { VocabularyExerciseResult } from "@/pwa/features/score/model/vocabulary-score";
import type { VocabularyQuestion } from "../../shared/types";
import { VocabularyStorageManager } from "@/pwa/features/score/storage/vocabulary-storage";

/**
 * Integrate vocabulary reading exercise results with vocabulary scoring system
 * 
 * @param allQuestions - All questions that were played in the game
 * @param wrongQuestions - Questions that had errors (first-attempt failed)
 * @param level - JLPT level
 * @param categoryId - Vocabulary category ID
 */
export const integrateVocabularyReadingGameScore = async (
  allQuestions: VocabularyQuestion[],
  wrongQuestions: VocabularyQuestion[],
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

    // Convert wrongQuestions array to Set for easier lookup by word id
    const errorQuestionIds = new Set(wrongQuestions.map(q => q.id));

    // Process all questions and determine first-attempt accuracy
    const exerciseResults: VocabularyExerciseResult[] = [];
    
    allQuestions.forEach((question) => {
      // Determine if this question was correct on first attempt
      const isCorrectFirstAttempt = !errorQuestionIds.has(question.id);

      const exerciseResult: VocabularyExerciseResult = {
        vocabularyId: question.word.id.toString(),
        kanji: question.word.kanji || "",
        hiragana: question.word.hiragana,
        romaji: question.word.romaji || "",
        categoryId: categoryId, // ✅ Save categoryId from game
        isCorrect: isCorrectFirstAttempt,
        exerciseType: "reading" as const,
        level: level as "N5" | "N4" | "N3" | "N2" | "N1",
      };

      exerciseResults.push(exerciseResult);
    });

    // Update mastery for each vocabulary word
    await VocabularyStorageManager.saveExerciseResults(userId, exerciseResults);

    console.log(`✅ Successfully integrated vocabulary reading game score for ${allQuestions.length} questions`);
    
  } catch (error) {
    console.error("❌ Error in vocabulary reading game score integration:", error);
    throw error;
  }
};

/**
 * Helper function to determine first-attempt success rate
 */
export const calculateVocabularyReadingFirstAttemptStats = (
  allQuestions: VocabularyQuestion[],
  wrongQuestions: VocabularyQuestion[]
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
