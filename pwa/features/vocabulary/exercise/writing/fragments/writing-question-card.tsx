"use client";

import React, { useEffect } from "react";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { WritingQuestionCard as WritingQuestionCardComponent } from "../components/writing-question-card";
import { generateCharacterTiles, getExpectedTileAnswer } from "../utils/generate-character-tiles";

interface WritingQuestionCardProps {
  timerDuration?: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export const WritingQuestionCard: React.FC<WritingQuestionCardProps> = ({
  timerDuration = 0,
  onTimeUp,
  isPaused = false,
}) => {
  const {
    getCurrentQuestion,
    questionState,
    gameState,
    setInputMode,
    getIsAnswered,
    getIsCurrentAnswerCorrect,
    selectTile,
    deselectCharacter,
    setAvailableTiles,
  } = useVocabularyWritingExerciseStore();

  const currentQuestion = getCurrentQuestion();
  const distractorPool = useVocabularyWritingExerciseStore.getState().getDistractorPool();

  // Generate tiles when question changes or input mode changes
  useEffect(() => {
    if (currentQuestion && !getIsAnswered()) {
      const tiles = generateCharacterTiles(
        currentQuestion,
        gameState.questions,
        questionState.inputMode,
        6,
        distractorPool
      );
      setAvailableTiles(tiles);
    }
  }, [currentQuestion?.id, questionState.inputMode]);

  if (!currentQuestion) {
    return null;
  }

  const expectedAnswer = getExpectedTileAnswer(currentQuestion, questionState.inputMode);

  return (
    <WritingQuestionCardComponent
      question={currentQuestion}
      selectedCharacters={questionState.selectedCharacters}
      availableTiles={questionState.availableTiles}
      onTileSelect={selectTile}
      onCharacterDeselect={deselectCharacter}
      inputMode={questionState.inputMode}
      onInputModeChange={setInputMode}
      isAnswered={getIsAnswered()}
      isCorrect={getIsCurrentAnswerCorrect()}
      expectedAnswer={expectedAnswer}
      timerDuration={timerDuration}
      onTimeUp={onTimeUp}
      isPaused={isPaused}
      questionIndex={questionState.currentQuestionIndex}
    />
  );
};
