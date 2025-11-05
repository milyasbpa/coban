"use client";

import { ReadingHeader } from "../fragments/reading-header";
import { ReadingGameResult } from "../fragments/reading-game-result";
import { AnswerForm } from "../fragments/answer-form";
import { ReadingCheckButton } from "../fragments/reading-check-button";
import { AnswerBottomSheet } from "../fragments/answer-bottomsheet";
import { ReadingDisplayOptionsControl } from "../fragments/reading-display-options-control";
import { useReadingExerciseStore } from "../store";
import { ModeSelector } from "../fragments";
import ReadingQuestion from "../fragments/reading-question";
import { useInitializeReadingGames } from "../utils/initalize-reading-game";

export function ReadingExerciseContainer() {
  const { gameState: { isGameComplete }, getCurrentQuestion } = useReadingExerciseStore();
  const currentQuestion = getCurrentQuestion();
  useInitializeReadingGames();
  if (isGameComplete) {
    return <ReadingGameResult />;
  }

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
      <ReadingHeader />

      <div className="p-4 max-w-2xl mx-auto pb-24">
        {/* Question Title */}
        <ReadingQuestion />

        <ModeSelector />

        {/* Answer Components */}
        <AnswerForm />
      </div>

      {/* Floating Check Button */}
      <ReadingCheckButton />

      {/* Answer Bottom Sheet */}
      <AnswerBottomSheet />

      {/* Display Options Control */}
      <ReadingDisplayOptionsControl />
    </div>
  );
}
