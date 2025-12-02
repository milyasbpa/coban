"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useInitializeVocabularyPairingGame } from "../utils/use-initialize-vocabulary-pairing-game";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { VocabularyPairingHeader } from "../fragments/vocabulary-pairing-header";
import { VocabularyPairingScoreHeader } from "../fragments/vocabulary-pairing-score-header";
import { VocabularyPairingGrid } from "../fragments/vocabulary-pairing-grid";
import { VocabularyPairingGameResult } from "../fragments/vocabulary-pairing-game-result";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";
import { useVocabularyExerciseSearchParams } from "../../utils/hooks";

export const VocabularyPairingExerciseContainer: React.FC = () => {
  const store = useVocabularyPairingExerciseStore();
  const { level, categoryId } = useVocabularyExerciseSearchParams();

  // Initialize game using custom hook
  useInitializeVocabularyPairingGame();

  // Get timer value from store (not URL params)
  const { timerEnabled, timerValue } = useTimerPreferenceStore();
  const effectiveTimerValue = timerEnabled ? timerValue : 0;
  
  // Calculate section duration: timerValue × pairs in current section
  const currentSectionWords = store.sectionState.gameWords;
  const sectionDuration = effectiveTimerValue > 0 ? effectiveTimerValue * currentSectionWords.length : 0;

  // Auto-submit section when timer expires
  const handleTimeUp = () => {
    // Auto-submit current section (move to next section or complete game)
    const hasMoreSections = store.moveToNextSection();
    if (!hasMoreSections) {
      // Game complete
      store.calculateAndSetScore();
      store.setGameComplete(true);
    }
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
        <VocabularyPairingScoreHeader 
          timerDuration={sectionDuration}
          onTimeUp={handleTimeUp}
          sectionIndex={store.sectionState.currentSectionIndex}
        />
        <VocabularyPairingGrid />
      </div>
    </div>
  );
};
