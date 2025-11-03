"use client";

import { useEffect, useMemo } from "react";
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
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";
  const selectedKanjiParam = searchParams.get("selectedKanji");

  // Parse selected kanji IDs from URL parameter
  const selectedKanjiIds = useMemo(() => {
    return selectedKanjiParam
      ? selectedKanjiParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : undefined;
  }, [selectedKanjiParam]);

  // Use store
  const { isGameComplete, getCurrentQuestion, initializeGame } =
    useReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();

  // Initialize game
  useEffect(() => {
    if (!lessonId && !topicId) return;

    if (topicId) {
      // Initialize with topicId
      const gameData = getReadingGameData(
        null,
        level,
        selectedKanjiIds,
        topicId
      );
      initializeGame(gameData.questions, gameData.totalQuestions);
    } else if (lessonId) {
      // Initialize with lessonId
      const gameData = getReadingGameData(
        parseInt(lessonId),
        level,
        selectedKanjiIds
      );
      initializeGame(gameData.questions, gameData.totalQuestions);
    }
  }, [lessonId, topicId, level, selectedKanjiIds, initializeGame]);

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
