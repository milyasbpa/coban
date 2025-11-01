"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { getScoreColor } from "../utils/score-colors";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

export function GameResult() {
  const {
    gameStats,
    canRetry,
    startRetryMode,
    generateRetrySession,
    globalWordsWithErrors,
    wordsWithErrors,
    isRetryMode,
  } = usePairingGameStore();
  const { score, correctPairs, totalWords, wrongAttempts } = gameStats;

  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const accuracy = Math.round(
    (correctPairs / (correctPairs + wrongAttempts)) * 100
  );
  const scoreColors = getScoreColor(score);

  // Perfect score (100%) triggers confetti
  const isPerfectScore = accuracy === 100 && wrongAttempts === 0;
  const canShowRetry = canRetry() && !isRetryMode;
  const allWrongWords = new Set([...globalWordsWithErrors, ...wordsWithErrors]);
  const wrongWordsCount = allWrongWords.size;

  const handleRetry = () => {
    startRetryMode();
    generateRetrySession();
  };

  useEffect(() => {
    // Set window dimensions for confetti
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Show confetti for perfect scores
    if (isPerfectScore) {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [isPerfectScore]);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confetti for perfect scores */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          numberOfPieces={200}
          recycle={false}
          gravity={0.1}
        />
      )}

      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {isRetryMode
                ? "Retry Complete! ⚡"
                : isPerfectScore
                ? "Perfect! 🎉"
                : "Bravo! 🎉"}
            </h1>
            <p className="text-muted-foreground">
              {isRetryMode
                ? `Retry completed with final score!`
                : isPerfectScore
                ? "Amazing! You got everything right!"
                : "Congratulations on completing the exercise!"}
            </p>
          </div>

          {/* Score Display */}
          <div
            className={`${scoreColors.bg} border-2 ${scoreColors.border} rounded-xl p-6`}
          >
            <div className={`text-4xl font-bold ${scoreColors.text} mb-2`}>
              {score}
            </div>
            <div className={`text-sm ${scoreColors.textSecondary}`}>
              Final Score
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Correct Pairs:</span>
              <span className="font-semibold text-foreground">
                {correctPairs}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Words:</span>
              <span className="font-semibold text-foreground">
                {totalWords}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wrong Attempts:</span>
              <span className="font-semibold text-foreground">
                {wrongAttempts}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accuracy:</span>
              <span className={`font-semibold ${scoreColors.text}`}>
                {accuracy}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {/* Retry Button - only show if there are wrong words and not in retry mode */}
            {canShowRetry && (
              <Button
                onClick={handleRetry}
                variant="default"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Wrong ({wrongWordsCount})
              </Button>
            )}

            <Button
              onClick={() => {
                // Emit restart event for container to handle
                window.dispatchEvent(new CustomEvent("gameRestart"));
              }}
              variant={canShowRetry ? "outline" : "default"}
              className="w-full"
            >
              Play Again
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
