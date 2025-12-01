import { VocabularyService } from "@/pwa/core/services/vocabulary";
import type { VocabularyExerciseResult } from "@/pwa/features/score/model/vocabulary-score";
import type { VocabularyQuestion } from "../../shared/types";
import { VocabularyFirestoreManager } from "@/pwa/features/score/storage/vocabulary-firestore";
import { VocabularyScoreCalculator } from "@/pwa/features/score/utils/vocabulary-score-calculator";

/**
 * Integrate vocabulary writing exercise results with vocabulary scoring system
 *
 * @param questions - All questions that were played in the exercise
 * @param wrongQuestions - Questions answered incorrectly
 * @param correctQuestions - Questions answered correctly
 * @param level - JLPT level
 * @param categoryId - Vocabulary category ID
 * @param userId - Firebase Auth user ID
 */
export const integrateVocabularyWritingExerciseScore = async (
  questions: VocabularyQuestion[],
  wrongQuestions: VocabularyQuestion[],
  correctQuestions: VocabularyQuestion[],
  level: string,
  categoryId: string,
  userId: string
) => {
  try {
    // Initialize user score if needed
    let userScore = await VocabularyFirestoreManager.getVocabularyScore(userId);

    if (!userScore) {
      userScore = await VocabularyFirestoreManager.createDefaultVocabularyScore(
        userId,
        level as "N5" | "N4" | "N3" | "N2" | "N1"
      );
    }

    // Create set of wrong question IDs for quick lookup
    const wrongQuestionIds = new Set(
      wrongQuestions.map((q) => q.word.id.toString())
    );

    // Process all questions and determine correctness
    const exerciseResults: VocabularyExerciseResult[] = [];

    questions.forEach((question) => {
      const vocabularyId = question.word.id.toString();
      const isCorrect = !wrongQuestionIds.has(vocabularyId);

      const exerciseResult: VocabularyExerciseResult = {
        vocabularyId: vocabularyId,
        kanji: question.word.kanji || "",
        hiragana: question.word.hiragana,
        romaji: question.word.romaji || "",
        categoryId: categoryId, // Save categoryId from exercise
        isCorrect: isCorrect,
        exerciseType: "writing" as const,
        level: level as "N5" | "N4" | "N3" | "N2" | "N1",
      };

      exerciseResults.push(exerciseResult);
    });

    // Update mastery for each vocabulary word
    await VocabularyFirestoreManager.saveExerciseResults(
      userId,
      exerciseResults
    );
  } catch (error) {
    console.error(
      "❌ Error in vocabulary writing exercise score integration:",
      error
    );
    throw error;
  }
};

/**
 * Helper function to calculate writing exercise statistics
 */
export const calculateWritingExerciseStats = (
  totalQuestions: number,
  correctQuestions: VocabularyQuestion[],
  wrongQuestions: VocabularyQuestion[]
) => {
  const correctCount = correctQuestions.length;
  const wrongCount = wrongQuestions.length;
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctCount,
    wrongCount,
    accuracy,
  };
};
