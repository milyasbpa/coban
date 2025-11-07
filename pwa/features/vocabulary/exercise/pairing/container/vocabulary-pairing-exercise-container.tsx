"use client";

import React, { useEffect } from "react";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { VocabularyPairingHeader } from "../fragments/vocabulary-pairing-header";
import { VocabularyPairingScoreHeader } from "../fragments/vocabulary-pairing-score-header";
import { VocabularyPairingGrid } from "../fragments/vocabulary-pairing-grid";
import { VocabularyPairingGameResult } from "../fragments/vocabulary-pairing-game-result";
import { VocabularyService } from "@/pwa/core/services/vocabulary";

interface VocabularyPairingExerciseContainerProps {
  level: string;
  categoryId: string;
}

export const VocabularyPairingExerciseContainer: React.FC<
  VocabularyPairingExerciseContainerProps
> = ({ level, categoryId }) => {
  const store = useVocabularyPairingExerciseStore();

  useEffect(() => {
    initializeExercise();
  }, [level, categoryId]);

  const initializeExercise = async () => {
    try {
      // Get vocabulary category
      const vocabularyCategory =
        VocabularyService.getVocabularyByCategoryString(categoryId, level);
        console.log(vocabularyCategory,'ini apa')
      if (!vocabularyCategory) {
        console.error("Not enough vocabulary words for exercise");
        return;
      }

      // Initialize the game with vocabulary words
      store.initializeGame(vocabularyCategory.vocabulary);
    } catch (error) {
      console.error("Failed to initialize vocabulary pairing exercise:", error);
    }
  };

  const handleCardClick = (card: any) => {
    // This is now handled in fragments via store
    // Remove this handler as fragments manage their own state
  };

  const handleRestart = () => {
    store.resetGame(store.gameState.allGameWords.length);
    initializeExercise();
  };

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
