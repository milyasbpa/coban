/**
 * Score Management System - Usage Examples
 * 
 * This file demonstrates how to integrate the score management system
 * with existing exercise components.
 */

import { useEffect } from "react";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
// Import will be available after creating the integration file
// import { ReadingExerciseIntegration } from "@/pwa/features/kanji/exercise/reading/utils/score-integration";

export function ExampleUsageInReadingExercise() {
  const { updateExerciseScore, updateKanjiMastery } = useScoreStore();
  
  // Example: When reading exercise is completed
  const handleExerciseComplete = async (
    lessonId: string,
    level: string,
    gameStats: any,
    answers: any[]
  ) => {
    // See ExerciseScoreIntegration.completeExercise() below for actual implementation
    console.log("Exercise completed", { lessonId, level, gameStats, answers });
  };
  
  // This is just an example - you would integrate this into your actual exercise component
  return null;
}

// Example: How to display progress in lesson cards
export function ExampleProgressDisplay() {
  const { getLessonProgress, getExerciseProgress, getOverallProgress } = useScoreStore();
  
  // Get lesson progress (0-100)
  const lessonProgress = getLessonProgress("lesson_1");
  
  // Get exercise-specific progress (0-100)
  const writingProgress = getExerciseProgress("writing", "lesson_1");
  const readingProgress = getExerciseProgress("reading", "lesson_1");
  const pairingProgress = getExerciseProgress("pairing", "lesson_1");
  
  // Get overall user progress
  const overallProgress = getOverallProgress();
  
  return (
    <div className="space-y-4">
      <div>Lesson Progress: {lessonProgress}%</div>
      <div>Writing Progress: {writingProgress}%</div>
      <div>Reading Progress: {readingProgress}%</div>
      <div>Pairing Progress: {pairingProgress}%</div>
      
      {overallProgress && (
        <div className="space-y-2">
          <div>Current Level: {overallProgress.currentLevel}</div>
          <div>Total Kanji Learned: {overallProgress.totalKanjiLearned}</div>
          <div>Mastered Kanji: {overallProgress.masteredKanji}</div>
        </div>
      )}
    </div>
  );
}

// Example: How to initialize user score system
export function ExampleInitialization() {
  const { initializeUser, isInitialized, isLoading } = useScoreStore();
  
  // Initialize user on app start
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initializeUser("user-123", "N5");
    }
  }, [initializeUser, isInitialized, isLoading]);
  
  return null;
}

// Example: Integration pattern for any exercise type
export class ExerciseScoreIntegration {
  static async completeExercise(
    exerciseType: "writing" | "reading" | "pairing",
    lessonId: string,
    level: string,
    results: {
      totalQuestions: number;
      correctAnswers: number;
      answers: Array<{
        kanji: string;
        isCorrect: boolean;
      }>;
    }
  ) {
    const { updateExerciseScore, updateKanjiMastery } = useScoreStore.getState();
    
    // Create exercise attempt
    const exerciseAttempt = {
      attemptId: `${exerciseType}_${lessonId}_${Date.now()}`,
      lessonId,
      exerciseType,
      level,
      totalQuestions: results.totalQuestions,
      correctAnswers: results.correctAnswers,
      answers: results.answers.map((answer, index) => ({
        kanjiId: answer.kanji,
        kanji: answer.kanji,
        isCorrect: answer.isCorrect,
      }))
    };
    
    // Update scores
    await updateExerciseScore(exerciseAttempt);
    
    // Update kanji mastery for each unique kanji
    const kanjiGroups = new Map();
    results.answers.forEach((answer, index) => {
      if (!kanjiGroups.has(answer.kanji)) {
        kanjiGroups.set(answer.kanji, []);
      }
      kanjiGroups.get(answer.kanji).push(exerciseAttempt.answers[index]);
    });
    
    for (const [kanji, questionResults] of kanjiGroups) {
      await updateKanjiMastery(kanji, kanji, questionResults);
    }
  }
}

/**
 * Integration Checklist:
 * 
 * 1. ✅ Initialize score system in main app (HomeContainer)
 * 2. ✅ Update lesson cards to show real progress (TopicLessonCard, StrokeLessonCard)
 * 3. ✅ Update exercise modal to show real progress (KanjiExerciseModal)
 * 4. ✅ Add development reset button (ResetStatisticsButton in Header)
 * 5. 🔄 Integrate with exercise completion (need to add to each exercise store)
 * 
 * To complete integration:
 * 
 * 1. In each exercise container (reading, writing, pairing), call ExerciseScoreIntegration.completeExercise() when exercise finishes
 * 2. Pass real lesson IDs instead of hardcoded values
 * 3. Ensure kanji IDs are consistent across the app
 * 4. Test the system with actual exercise completions
 * 5. Add loading states and error handling as needed
 */