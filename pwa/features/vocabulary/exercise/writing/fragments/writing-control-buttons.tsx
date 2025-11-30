"use client";

import React from "react";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { WritingControlButtons as WritingControlButtonsComponent } from "../components/writing-control-buttons";
import { checkTileAnswer, getExpectedTileAnswer } from "../utils/generate-character-tiles";
import { calculateScore } from "../utils/vocabulary-writing.utils";

export const WritingControlButtons: React.FC = () => {
  const store = useVocabularyWritingExerciseStore();

  const handleCheckAnswer = () => {
    const currentQuestion = store.getCurrentQuestion();
    if (!currentQuestion || store.questionState.selectedCharacters.length === 0) return;

    const selectedAnswer = store.questionState.selectedCharacters.join("");
    const expectedAnswer = getExpectedTileAnswer(currentQuestion, store.questionState.inputMode);
    const isCorrect = checkTileAnswer(store.questionState.selectedCharacters, expectedAnswer);

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
    />
  );
};
