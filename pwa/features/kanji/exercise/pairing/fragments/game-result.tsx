"use client";

import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { getScoreColor } from "../utils/score-colors";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useWindowSize } from "usehooks-ts";

export function GameResult() {
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

  const {
    canRetry,
    startRetryMode,
    generateRetrySession,
    gameState: { isRetryMode, score, errorWords: globalErrorWords },
    sectionState: { errorWords: sectionErrorWords },
    initializeGame,
  } = usePairingGameStore();

  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const scoreColors = getScoreColor(score);

  // Perfect score (100%) triggers confetti
  const isPerfectScore = score === 100;
  const canShowRetry = canRetry() && !isRetryMode;
  const allWrongWords = new Set([...globalErrorWords, ...sectionErrorWords]);
  const wrongWordsCount = allWrongWords.size;

  const handleRetry = () => {
    startRetryMode();
    generateRetrySession();
  };

  const handleGameRestart = () => {
    // Use the reusable function with section index reset
    if (!lessonId && !topicId) return;

    if (topicId) {
      initializeGame({
        lessonId: null,
        level,
        shouldResetSectionIndex: true,
        selectedKanjiIds,
        topicId,
      });
    } else if (lessonId) {
      initializeGame({
        lessonId: parseInt(lessonId),
        level,
        shouldResetSectionIndex: true,
        selectedKanjiIds,
      });
    }
  };

  useEffect(() => {
    // Show confetti for perfect scores
    if (isPerfectScore) {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPerfectScore]);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confetti for perfect scores */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
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
              onClick={handleGameRestart}
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
