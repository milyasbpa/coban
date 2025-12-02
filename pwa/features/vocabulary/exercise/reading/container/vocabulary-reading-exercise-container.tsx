"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { VocabularyReadingHeader } from "../fragments/vocabulary-reading-header";
import { VocabularyReadingGameResult } from "../fragments/vocabulary-reading-game-result";
import { VocabularyReadingQuestion } from "../fragments/vocabulary-reading-question";
import { AnswerSection } from "../fragments/answer-section";
import { VocabularyReadingCheckButton } from "../fragments/vocabulary-reading-check-button";
import { VocabularyAnswerBottomSheet } from "../fragments/vocabulary-answer-bottomsheet";
import { useInitializeVocabularyReadingGame } from "../utils/use-initialize-vocabulary-reading-game";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";

export const VocabularyReadingExerciseContainer: React.FC = () => {
  const searchParams = useSearchParams();
  const store = useVocabularyReadingExerciseStore();
  
  // Initialize game using custom hook (supports selectedVocabulary from searchParams)
  useInitializeVocabularyReadingGame();

  // Get timer value from store (not URL params)
  const { timerEnabled, timerValue } = useTimerPreferenceStore();
  const timerDuration = timerEnabled ? timerValue : 0;

  if (store.gameState.isComplete) {
    return <VocabularyReadingGameResult />;
  }

  const currentQuestion = store.getCurrentQuestion();

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Auto-submit when timer expires
  const handleTimeUp = () => {
    // Auto-submit current answer (could be empty = wrong)
    store.handleCheckAnswer();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <VocabularyReadingHeader />

      <div className="p-4 max-w-2xl mx-auto pb-24">
        {/* Question with timer */}
        <VocabularyReadingQuestion 
          timerDuration={timerDuration}
          onTimeUp={handleTimeUp}
          isPaused={store.questionState.showBottomSheet}
        />

        {/* Question Card with Options */}
        <AnswerSection />
      </div>

      {/* Floating Check Button */}
      <VocabularyReadingCheckButton />

      {/* Answer Bottom Sheet */}
      <VocabularyAnswerBottomSheet />
    </div>
  );
};