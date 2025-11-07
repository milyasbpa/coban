"use client";

import React, { useEffect } from "react";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { VocabularyReadingHeader } from "../fragments/vocabulary-reading-header";
import { VocabularyReadingGameResult } from "../fragments/vocabulary-reading-game-result";
import { VocabularyReadingQuestion } from "../fragments/vocabulary-reading-question";
import { QuestionCard } from "../fragments/question-card";
import { VocabularyReadingCheckButton } from "../fragments/vocabulary-reading-check-button";

interface VocabularyReadingExerciseContainerProps {
  level: string;
  categoryId: string;
}

export const VocabularyReadingExerciseContainer: React.FC<VocabularyReadingExerciseContainerProps> = ({
  level,
  categoryId,
}) => {
  const store = useVocabularyReadingExerciseStore();

  useEffect(() => {
    store.initializeExercise(level, categoryId);
  }, [level, categoryId]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <VocabularyReadingHeader />

      <div className="p-4 max-w-2xl mx-auto pb-24">
        {/* Question */}
        <VocabularyReadingQuestion />

        {/* Question Card with Options */}
        <QuestionCard />
      </div>

      {/* Floating Check/Next Button */}
      <VocabularyReadingCheckButton />
    </div>
  );
};