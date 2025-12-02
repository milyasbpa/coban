"use client";

import { useSearchParams } from "next/navigation";
import { ReadingHeader } from "../fragments/reading-header";
import { ReadingGameResult } from "../fragments/reading-game-result";
import { AnswerForm } from "../fragments/answer-form";
import { ReadingCheckButton } from "../fragments/reading-check-button";
import { AnswerBottomSheet } from "../fragments/answer-bottomsheet";
import { useReadingExerciseStore } from "../store";
import { ReadingModeSelector } from "../fragments";
import ReadingQuestion from "../fragments/reading-question";
import { useInitializeReadingGames } from "../utils/initalize-reading-game";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";

export function ReadingExerciseContainer() {
  const searchParams = useSearchParams();
  const {
    gameState: { isComplete },
    questionState,
    getCurrentQuestion,
    setCurrentResult,
    setShowBottomSheet,
    addWrongQuestion,
    addCorrectQuestion,
  } = useReadingExerciseStore();
  const currentQuestion = getCurrentQuestion();
  useInitializeReadingGames();

  // Get timer value from store (not URL params)
  const { timerEnabled, timerValue } = useTimerPreferenceStore();
  const timerDuration = timerEnabled ? timerValue : 0;

  // Auto-submit when timer expires
  const handleTimeUp = () => {
    if (!currentQuestion) return;

    const { inputMode, selectedOption, directInput } = questionState;
    let userAnswer = "";
    let selectedKanjiExample: any = null;

    if (inputMode === "multiple-choice") {
      selectedKanjiExample = selectedOption;
      userAnswer = selectedOption?.furigana || "";
    } else {
      userAnswer = directInput.trim();
    }

    const result = {
      selectedAnswer: selectedKanjiExample || { furigana: userAnswer },
      userAnswer: userAnswer,
    };
    setCurrentResult(result);
    setShowBottomSheet(true);

    const isCorrect =
      inputMode === "multiple-choice"
        ? selectedKanjiExample?.furigana === currentQuestion.furigana
        : userAnswer === currentQuestion.furigana;

    if (!isCorrect) {
      addWrongQuestion(currentQuestion);
    } else {
      addCorrectQuestion(currentQuestion);
    }
  };
  if (isComplete) {
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
        {/* Question Title with timer */}
        <ReadingQuestion 
          timerDuration={timerDuration}
          onTimeUp={handleTimeUp}
          isPaused={questionState.showBottomSheet}
        />

        <ReadingModeSelector />

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
