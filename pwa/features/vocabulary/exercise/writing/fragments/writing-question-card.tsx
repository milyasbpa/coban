"use client";

import React from "react";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { WritingQuestionCard as WritingQuestionCardComponent } from "../components/writing-question-card";

export const WritingQuestionCard: React.FC = () => {
  const {
    getCurrentQuestion,
    questionState,
    setUserInput,
    setInputMode,
    getCanCheck,
    getIsAnswered,
    getIsCurrentAnswerCorrect,
  } = useVocabularyWritingExerciseStore();

  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion) {
    return null;
  }

  return (
    <WritingQuestionCardComponent
      question={currentQuestion}
      userInput={questionState.userInput}
      onInputChange={setUserInput}
      inputMode={questionState.inputMode}
      onInputModeChange={setInputMode}
      canCheck={getCanCheck()}
      isAnswered={getIsAnswered()}
      isCorrect={getIsCurrentAnswerCorrect()}
    />
  );
};
