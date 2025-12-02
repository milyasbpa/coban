"use client";

import { useSearchParams } from "next/navigation";
import { PairingScoreHeader } from "../fragments/pairing-score-header";
import { PairingGameResult } from "../fragments/pairing-game-result";
import { PairingHeader } from "../fragments/pairing-header";
import { PairingGameGrid } from "../fragments/pairing-game-grid";
import { usePairingGameStore } from "../store/pairing-game.store";
import { useInitializePairingGame } from "../utils/initialize-pairing-game";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";

export function KanjiPairingExerciseContainer() {
  const searchParams = useSearchParams();
  useInitializePairingGame();

  // Store
  const { 
    gameState: { isComplete: isGameComplete, isRetryMode },
    sectionState,
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete
  } = usePairingGameStore();

  // Get timer value from store (not URL params)
  const { timerEnabled, timerValue } = useTimerPreferenceStore();
  const effectiveTimerValue = timerEnabled ? timerValue : 0;
  
  // Calculate section duration: timerValue × pairs in current section
  const currentSectionWords = sectionState.allSections[sectionState.currentSectionIndex] || [];
  const sectionDuration = effectiveTimerValue > 0 ? effectiveTimerValue * currentSectionWords.length : 0;

  // Auto-submit section when timer expires
  const handleTimeUp = () => {
    const hasMoreSections = moveToNextSection();
    if (!hasMoreSections) {
      // Game complete
      calculateAndSetScore();
      setGameComplete(true);
    }
  };

  // Show PairingGameResult only if game is complete AND not in active retry mode
  if (isGameComplete && !isRetryMode) {
    return <PairingGameResult />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PairingHeader />

      <div className="p-4">
        {/* Score Header with timer */}
        <PairingScoreHeader 
          timerDuration={sectionDuration}
          onTimeUp={handleTimeUp}
          sectionIndex={sectionState.currentSectionIndex}
        />

        {/* Game Grid */}
        <PairingGameGrid />
      </div>
    </div>
  );
}
