"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KanjiDisplay } from "../components/kanji-display";
import { ReadingHeader } from "../fragments/reading-header";
import { ReadingGameResult } from "../fragments/reading-game-result";
import { AnswerForm } from "../fragments/answer-form";
import { ReadingCheckButton } from "../fragments/reading-check-button";
import { AnswerBottomSheet } from "../fragments/answer-bottomsheet";
import { ReadingDisplayOptionsControl } from "../fragments/reading-display-options-control";
import { getReadingGameData } from "../utils/reading-game";
import { useReadingExerciseStore } from "../store";
import { ModeSelector } from "../fragments";
import ReadingQuestion from "../fragments/reading-question";

export function ReadingExerciseContainer() {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  // Use store
  const { isGameComplete, getCurrentQuestion, initializeGame } =
    useReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();

  // Initialize game
  useEffect(() => {
    if (lessonId) {
      const gameData = getReadingGameData(parseInt(lessonId), level);
      initializeGame(gameData.questions, gameData.totalQuestions);
    }
  }, [lessonId, level, initializeGame]);

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
