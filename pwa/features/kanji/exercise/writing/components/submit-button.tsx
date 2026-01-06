"use client";

import { Button } from "@/pwa/core/components/button";
import { useWritingExerciseStore } from "../store/writing-exercise.store";

export function SubmitButton() {
  const { questionState, checkAnswer, setIsCorrect, setShowFeedback } =
    useWritingExerciseStore();

  const { selectedKanji, showAnswer } = questionState;
  const canSubmit = selectedKanji.length > 0 && !showAnswer;

  const handleSubmitAnswer = () => {
    if (selectedKanji.length === 0) return;

    const result = checkAnswer();
    setIsCorrect(result);
    setShowFeedback(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t border-border p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={handleSubmitAnswer}
          className="w-full"
          disabled={!canSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
