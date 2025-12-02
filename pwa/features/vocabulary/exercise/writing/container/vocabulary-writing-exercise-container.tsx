"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { VocabularyWritingHeader } from "../fragments/vocabulary-writing-header";
import { WritingQuestionCard } from "../fragments/writing-question-card";
import { WritingControlButtons } from "../fragments/writing-control-buttons";
import { VocabularyWritingGameResult } from "../fragments/vocabulary-writing-game-result";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { generateWritingQuestions } from "../utils/vocabulary-writing.utils";
import { checkTileAnswer, getExpectedTileAnswer } from "../utils/generate-character-tiles";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";

export const VocabularyWritingExerciseContainer: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useVocabularyWritingExerciseStore();

  const level = searchParams.get("level") || "n5";
  const categoryId = searchParams.get("categoryId") || "ANGKA";
  const selectedVocabularyParam = searchParams.get("selectedVocabulary");
  
  // Get timer value from store (not URL params)
  const { timerEnabled, timerValue } = useTimerPreferenceStore();
  const timerDuration = timerEnabled ? timerValue : 0;

  // Parse selectedVocabulary IDs from URL
  const selectedVocabularyIds = React.useMemo(() => {
    return selectedVocabularyParam
      ? selectedVocabularyParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : undefined;
  }, [selectedVocabularyParam]);

  useEffect(() => {
    initializeExercise();
  }, [level, categoryId, selectedVocabularyParam]);

  const initializeExercise = async () => {
    try {
      // Get vocabulary category
      const vocabularyCategory = VocabularyService.getVocabularyByCategoryString(categoryId, level);
      
      if (!vocabularyCategory || vocabularyCategory.vocabulary.length < 1) {
        console.error("Not enough vocabulary words for exercise");
        return;
      }

      // Filter vocabulary if selectedVocabularyIds provided (from selection mode)
      let vocabularyWords = vocabularyCategory.vocabulary;
      if (selectedVocabularyIds && selectedVocabularyIds.length > 0) {
        vocabularyWords = vocabularyCategory.vocabulary.filter((word) =>
          selectedVocabularyIds.includes(word.id)
        );

        if (vocabularyWords.length === 0) {
          console.error("No vocabulary words found with selected IDs");
          return;
        }
      }

      // Generate questions from vocabulary words
      const questions = generateWritingQuestions(vocabularyWords, "meaning-to-romaji");
      
      // Initialize the game with level and categoryId for score integration
      store.initializeGame(questions, level, categoryId);
    } catch (error) {
      console.error("Failed to initialize vocabulary writing exercise:", error);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  // Auto-submit when timer expires
  const handleTimeUp = () => {
    const currentQuestion = store.getCurrentQuestion();
    if (!currentQuestion) return;

    const selectedAnswer = store.questionState.selectedCharacters.join("");
    const expectedAnswer = getExpectedTileAnswer(currentQuestion, store.questionState.inputMode);
    const isCorrect = checkTileAnswer(store.questionState.selectedCharacters, expectedAnswer);

    // Set result for UI feedback
    store.setCurrentResult({ isCorrect });

    // Add to correct or wrong questions
    if (isCorrect) {
      store.addCorrectQuestion(currentQuestion);
    } else {
      store.addWrongQuestion(currentQuestion);
    }

    // Show bottom sheet with result
    store.setShowBottomSheet(true);
  };

  if (store.gameState.isComplete) {
    return <VocabularyWritingGameResult />;
  }

  const currentQuestion = store.getCurrentQuestion();

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VocabularyWritingHeader />
      
      <div className="container mx-auto px-4 py-8 pb-24 space-y-6">
        <WritingQuestionCard 
          timerDuration={timerDuration}
          onTimeUp={handleTimeUp}
          isPaused={store.questionState.showBottomSheet}
        />
      </div>
      
      <WritingControlButtons />
    </div>
  );
};