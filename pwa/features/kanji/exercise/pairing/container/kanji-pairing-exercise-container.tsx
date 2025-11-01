"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreHeader } from "../fragments/score-header";
import { GameResult } from "../fragments/game-result";
import { PairingHeader } from "../fragments/pairing-header";
import { GameGrid } from "../fragments/game-grid";
import { PairingDisplayOptionsControl } from "../fragments/pairing-display-options-control";
import { usePairingGameStore } from "../store/pairing-game.store";

export function KanjiPairingExerciseContainer() {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  // Store
  const {
    isGameComplete,
    isRetryMode,
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete,
    initializeGame,
  } = usePairingGameStore();

  // Initialize game on mount
  useEffect(() => {
    if (!lessonId) return;
    initializeGame(parseInt(lessonId), level);
  }, [lessonId, level, initializeGame]);

  // Listen for section complete events from GameGrid
  useEffect(() => {
    const handleSectionComplete = () => {
      const hasMoreSections = moveToNextSection();
      if (!hasMoreSections) {
        // Game complete
        calculateAndSetScore();
        setGameComplete(true);
      }
    };

    const handleGameRestart = () => {
      // Use the reusable function with section index reset
      if (!lessonId) return;
      initializeGame(parseInt(lessonId), level, true);
    };

    const handleRetryComplete = () => {
      // Retry is complete, game result will show automatically
      // No need to do anything here as finishRetryMode handles state
    };

    window.addEventListener("sectionComplete", handleSectionComplete);
    window.addEventListener("gameRestart", handleGameRestart);
    window.addEventListener("retryComplete", handleRetryComplete);

    return () => {
      window.removeEventListener("sectionComplete", handleSectionComplete);
      window.removeEventListener("gameRestart", handleGameRestart);
      window.removeEventListener("retryComplete", handleRetryComplete);
    };
  }, [
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete,
    initializeGame,
    lessonId,
    level,
  ]);

  // Show GameResult only if game is complete AND not in active retry mode
  if (isGameComplete && !isRetryMode) {
    return <GameResult />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PairingHeader />

      <div className="p-4">
        {/* Score Header */}
        <ScoreHeader />

        {/* Game Grid */}
        <GameGrid />
      </div>

      {/* Display Options Control */}
      <PairingDisplayOptionsControl />
    </div>
  );
}
