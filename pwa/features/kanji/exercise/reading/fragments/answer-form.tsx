"use client";

import { AnswerInput } from "../components/answer-input";
import { useReadingExerciseStore } from "../store";

export function AnswerForm() {
  // Get answer input related state from store (no props needed)
  const {
    questionState: { inputMode, selectedOption, directInput },
    getCurrentQuestion,
    getIsAnswered,
    setSelectedOption,
    setDirectInput,
  } = useReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();
  const isAnswered = getIsAnswered();

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
