"use client";

import { AnswerInput } from "../components/answer-input";
import { useReadingExerciseStore } from "../store";

export function AnswerForm() {
  // Get answer input related state from store (no props needed)
  const {
    inputMode,
    selectedOption,
    directInput,
    isAnswered,
    getCurrentQuestion,
    setSelectedOption,
    setDirectInput,
  } = useReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion) {
    return null;
  }

  return (
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
  );
}
