"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KanjiDisplay } from "../components/kanji-display";
import { ReadingHeader } from "../fragments/reading-header";
import { ReadingGameResult } from "../fragments/reading-game-result";
import { AnswerForm } from "../fragments/answer-form";
import { ReadingCheckButton } from "../fragments/reading-check-button";
import { AnswerBottomSheet } from "../fragments/answer-bottomsheet";
import { getReadingGameData } from "../utils/reading-game";
import { useReadingExerciseStore } from "../store";
import { ModeSelector } from "../fragments";

export function ReadingExerciseContainer() {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  // Use store
  const { gameStats, isGameComplete, getCurrentQuestion, initializeGame } =
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
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-foreground mb-4">
            Choose the correct reading
          </h1>

          {/* Kanji Display */}
          <KanjiDisplay kanji={currentQuestion.kanji} />
        </div>

        <ModeSelector />

        {/* Answer Components */}
        <AnswerForm />
      </div>

      {/* Floating Check Button */}
      <ReadingCheckButton />

      {/* Answer Bottom Sheet */}
      <AnswerBottomSheet />
    </div>
  );
}
