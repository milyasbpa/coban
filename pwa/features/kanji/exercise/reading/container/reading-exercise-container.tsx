"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KanjiDisplay } from "../components/kanji-display";
import { AnswerInput } from "../components/answer-input";
import { ModeSelector } from "../fragments/mode-selector";
import { AnswerBottomSheet } from "../fragments/answer-bottomsheet";
import { ReadingHeader } from "../fragments/reading-header";
import { ReadingCheckButton } from "../fragments/reading-check-button";
import { getReadingGameData } from "../utils/reading-game";
import { useReadingExerciseStore } from "../store";

export function ReadingExerciseContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  // Use store
  const {
    inputMode,
    selectedOption,
    directInput,
    isAnswered,
    gameStats,
    isGameComplete,
    getCurrentQuestion,
    getProgress,
    initializeGame,
    setSelectedOption,
    setDirectInput,
    handleNextQuestion,
    restartGame,
  } = useReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();

  // Initialize game
  useEffect(() => {
    if (lessonId) {
      const gameData = getReadingGameData(parseInt(lessonId), level);
      initializeGame(gameData.questions, gameData.totalQuestions);
    }
  }, [lessonId, level, initializeGame]);

  const handleRestart = () => {
    restartGame();
  };

  const handleBackToHome = () => {
    router.back();
  };

  // if (isGameComplete) {
  //   return (
  //     <GameResult
  //       stats={{
  //         totalWords: gameStats.totalQuestions,
  //         correctPairs: gameStats.correctAnswers,
  //         wrongAttempts: gameStats.wrongAnswers,
  //         currentSection: 1,
  //         totalSections: 1,
  //         score: gameStats.score
  //       }}
  //       onRestart={handleRestart}
  //       onBackToHome={handleBackToHome}
  //     />
  //   );
  // }

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

        {/* Mode Selector */}
        <ModeSelector />

        {/* Answer Input */}
        <div className="mb-8">
          <AnswerInput
            mode={inputMode}
            options={currentQuestion.options}
            selectedOption={selectedOption}
            directInput={directInput}
            onOptionSelect={setSelectedOption}
            onInputChange={setDirectInput}
            disabled={isAnswered}
          />
        </div>
      </div>

      {/* Floating Check Button */}
      <ReadingCheckButton />

      {/* Answer Bottom Sheet */}
      <AnswerBottomSheet />
    </div>
  );
}
