"use client";

import { Button } from "@/pwa/core/components/button";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";

export function VocabularyReadingCheckButton() {
  const {
    questionState: { inputMode, selectedOption, directInput },
    getCurrentQuestion,
    getCanCheck,
    getIsAnswered,
    setCurrentResult,
    setShowBottomSheet,
    addWrongQuestion,
    addCorrectQuestion,
  } = useVocabularyReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();
  const canCheck = getCanCheck();
  const isAnswered = getIsAnswered();

  const handleCheckAnswer = async () => {
    if (!currentQuestion) return;

    let userAnswer = "";
    let selectedAnswer: string | null = null;

    if (inputMode === "multiple-choice") {
      if (!selectedOption) return; // No option selected
      selectedAnswer = selectedOption;
      userAnswer = selectedOption;
    } else {
      userAnswer = directInput.trim();
      if (!userAnswer) return; // No answer provided
    }

    const result = {
      selectedAnswer: selectedAnswer || userAnswer,
      userAnswer: userAnswer,
    };
    setCurrentResult(result);
    setShowBottomSheet(true);

    // Check if answer is correct
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    // Track wrong questions for retry
    if (!isCorrect) {
      addWrongQuestion(currentQuestion);
    }

    // Update stats - add to correctQuestions array if correct
    if (isCorrect) {
      addCorrectQuestion(currentQuestion);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t border-border p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={handleCheckAnswer}
          disabled={!canCheck || isAnswered}
          className="w-full h-10 text-sm bg-primary disabled:bg-muted text-white disabled:text-foreground"
        >
          Check
        </Button>
      </div>
    </div>
  );
}