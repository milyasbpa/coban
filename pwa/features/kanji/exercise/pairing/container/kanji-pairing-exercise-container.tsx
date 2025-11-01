"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreHeader } from "../fragments/score-header";
import { GameResult } from "../fragments/game-result";
import { PairingHeader } from "../fragments/pairing-header";
import { GameGrid } from "../fragments/game-grid";
import { PairingDisplayOptionsControl } from "../fragments/pairing-display-options-control";
import { usePairingGameStore } from "../store/pairing-game.store";
import {
  getPairingGameData,
  getSections,
  PairingWord,
  shuffleArray,
} from "../utils/pairing-game";

export function KanjiPairingExerciseContainer() {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  // Game state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [allSections, setAllSections] = useState<PairingWord[][]>([]);

  // Store
  const {
    gameStats,
    isGameComplete,
    isRetryMode,
    updateStats,
    setGameComplete,
    calculateAndSetScore,
    loadSection,
    setAllGameWords,
    resetGame,
  } = usePairingGameStore();

  // Initialize game
  useEffect(() => {
    if (lessonId) {
      const gameData = getPairingGameData(parseInt(lessonId), level);

      // Shuffle all words first for better randomness
      const shuffledWords = shuffleArray(gameData.words);

      // Get initial sections
      const sections = getSections(shuffledWords);

      setAllSections(sections);
      resetGame(gameData.totalWords, sections.length);

      // Store shuffled words for retry system
      setAllGameWords(shuffledWords);

      // Load first section
      if (sections.length > 0) {
        loadSection(sections[0]);
      }
    }
  }, [lessonId, level]);

  // Listen for section complete events from GameGrid
  useEffect(() => {
    const handleSectionComplete = () => {
      if (currentSectionIndex + 1 < allSections.length) {
        // Move to next section
        setCurrentSectionIndex((prev) => prev + 1);
        updateStats({ currentSection: gameStats.currentSection + 1 });
        loadSection(allSections[currentSectionIndex + 1]);
      } else {
        // Game complete
        calculateAndSetScore();
        setGameComplete(true);
      }
    };

    const handleGameRestart = () => {
      if (!lessonId) return;
      const gameData = getPairingGameData(parseInt(lessonId), level);
      // Shuffle all words first for better randomness
      const shuffledWords = shuffleArray(gameData.words);
      // Get initial sections
      const sections = getSections(shuffledWords);
      resetGame(gameData.totalWords, sections.length);
      setCurrentSectionIndex(0);
      if (allSections.length > 0) {
        loadSection(allSections[0]);
      }
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
    currentSectionIndex,
    allSections,
    gameStats.currentSection,
    updateStats,
    loadSection,
    calculateAndSetScore,
    setGameComplete,
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
