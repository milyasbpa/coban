"use client";

import { PairingScoreHeader } from "../fragments/pairing-score-header";
import { PairingGameResult } from "../fragments/pairing-game-result";
import { PairingHeader } from "../fragments/pairing-header";
import { PairingGameGrid } from "../fragments/pairing-game-grid";
import { PairingDisplayOptionsControl } from "../fragments/pairing-display-options-control";
import { usePairingGameStore } from "../store/pairing-game.store";
import { useInitializePairingGame } from "../utils/initialize-pairing-game";

export function KanjiPairingExerciseContainer() {
  useInitializePairingGame();

  // Store
  const { gameState: { isComplete: isGameComplete, isRetryMode } } = usePairingGameStore();

  // Show PairingGameResult only if game is complete AND not in active retry mode
  if (isGameComplete && !isRetryMode) {
    return <PairingGameResult />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PairingHeader />

      <div className="p-4">
        {/* Score Header */}
        <PairingScoreHeader />

        {/* Game Grid */}
        <PairingGameGrid />
      </div>

      {/* Display Options Control */}
      <PairingDisplayOptionsControl />
    </div>
  );
}
