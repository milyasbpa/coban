"use client";

import { Button } from "@/pwa/core/components/button";
import { useReadingExerciseStore } from "../store";
import { checkAnswer } from "../utils/reading-game";

export function ReadingCheckButton() {
  const {
    questionState: { inputMode, selectedOption, directInput, isAnswered },
    gameState: { gameStats },
    getCurrentQuestion,
    getCanCheck,
    setCurrentResult,
    setIsAnswered,
    setShowBottomSheet,
    updateGameStats,
    addWrongQuestion,
  } = useReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();
  const canCheck = getCanCheck();

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;

    const userAnswer =
      inputMode === "multiple-choice" ? selectedOption : directInput;

    if (!userAnswer.trim()) return; // No answer provided

    const result = checkAnswer(currentQuestion, userAnswer);
    setCurrentResult(result);
    setIsAnswered(true);
    setShowBottomSheet(true);

    // Track wrong questions for retry
    if (!result.isCorrect) {
      addWrongQuestion(currentQuestion);
    }

    // Update stats
    updateGameStats({
      correctAnswers: gameStats.correctAnswers + (result.isCorrect ? 1 : 0),
      wrongAnswers: gameStats.wrongAnswers + (result.isCorrect ? 0 : 1),
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t border-border p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={handleCheckAnswer}
          disabled={!canCheck || isAnswered}
          className="w-full h-16 text-lg bg-primary disabled:bg-muted text-white disabled:text-foreground"
        >
          Check
        </Button>
      </div>
    </div>
  );
}
