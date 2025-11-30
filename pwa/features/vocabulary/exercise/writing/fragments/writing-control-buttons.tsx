"use client";

import React from "react";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { WritingControlButtons as WritingControlButtonsComponent } from "../components/writing-control-buttons";
import { checkWritingAnswer, calculateScore } from "../utils/vocabulary-writing.utils";

export const WritingControlButtons: React.FC = () => {
  const store = useVocabularyWritingExerciseStore();

  const handleCheckAnswer = () => {
    const currentQuestion = store.getCurrentQuestion();
    if (!currentQuestion || !store.questionState.userInput.trim()) return;

    const isCorrect = checkWritingAnswer(
      currentQuestion,
      store.questionState.userInput,
      store.questionState.inputMode
    );

    // Set result for UI feedback
    store.setCurrentResult({ isCorrect });

    // Add to correct or wrong questions
    if (isCorrect) {
      store.addCorrectQuestion(currentQuestion);
    } else {
      store.addWrongQuestion(currentQuestion);
    }

    // Show bottom sheet with result
    store.setShowBottomSheet(true);
  };

  const handleNextQuestion = () => {
    store.handleNextQuestion(calculateScore);
  };

  return (
    <WritingControlButtonsComponent
      canCheck={store.getCanCheck()}
      isAnswered={store.getIsAnswered()}
      isCorrect={store.getIsCurrentAnswerCorrect()}
      onCheck={handleCheckAnswer}
      onNext={handleNextQuestion}
      onResetAnswer={store.resetAnswer}
    />
  );
};
