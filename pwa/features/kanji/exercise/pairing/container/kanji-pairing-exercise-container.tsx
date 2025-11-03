"use client";

import { useEffect, useMemo } from "react";
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
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";
  const selectedKanjiParam = searchParams.get("selectedKanji");

  // Parse selected kanji IDs from URL parameter with memoization to prevent re-creation
  const selectedKanjiIds = useMemo(() => {
    return selectedKanjiParam
      ? selectedKanjiParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : undefined;
  }, [selectedKanjiParam]);

  // Store
  const {
    isGameComplete,
    isRetryMode,
    initializeGame,
  } = usePairingGameStore();

  // Initialize game on mount
  useEffect(() => {
    if (!lessonId && !topicId) return;

    if (topicId) {
      // Initialize with topicId
      initializeGame(null, level, false, selectedKanjiIds, topicId);
    } else if (lessonId) {
      // Initialize with lessonId
      initializeGame(parseInt(lessonId), level, false, selectedKanjiIds);
    }
  }, [lessonId, topicId, level, selectedKanjiIds, initializeGame]);

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
