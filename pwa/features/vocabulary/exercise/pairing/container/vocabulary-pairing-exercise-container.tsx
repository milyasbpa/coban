"use client";

import React from "react";
import { useInitializeVocabularyPairingGame } from "../utils/use-initialize-vocabulary-pairing-game";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { VocabularyPairingHeader } from "../fragments/vocabulary-pairing-header";
import { VocabularyPairingScoreHeader } from "../fragments/vocabulary-pairing-score-header";
import { VocabularyPairingGrid } from "../fragments/vocabulary-pairing-grid";
import { VocabularyPairingGameResult } from "../fragments/vocabulary-pairing-game-result";

interface VocabularyPairingExerciseContainerProps {
  level: string;
  categoryId: string;
}

export const VocabularyPairingExerciseContainer: React.FC<
  VocabularyPairingExerciseContainerProps
> = ({ level, categoryId }) => {
  const store = useVocabularyPairingExerciseStore();

  // Initialize game using custom hook
  useInitializeVocabularyPairingGame();

  if (store.gameState.isComplete) {
    return <VocabularyPairingGameResult />;
  }

  if (store.gameState.allGameWords.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <VocabularyPairingHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VocabularyPairingHeader />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <VocabularyPairingScoreHeader />
        <VocabularyPairingGrid />
      </div>
    </div>
  );
};
