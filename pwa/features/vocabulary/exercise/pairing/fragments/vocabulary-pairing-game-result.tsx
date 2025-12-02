"use client";

import { useMemo } from "react";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { getScoreColor } from "../../utils/score-colors";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function VocabularyPairingGameResult() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";
  const selectedVocabularyParam = searchParams.get("selectedVocabulary");

  // Parse selected vocabulary IDs from URL parameter with memoization to prevent re-creation
  const selectedVocabularyIds = useMemo(() => {
    return selectedVocabularyParam
      ? selectedVocabularyParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : undefined;
  }, [selectedVocabularyParam]);

  const {
    canRetry,
    startRetryMode,
    generateRetrySession,
    gameState: { isRetryMode, score, errorWords: globalErrorWords, correctAnswers, allGameWords },
    sectionState: { errorWords: sectionErrorWords },
    initializeGame,
  } = useVocabularyPairingExerciseStore();

  const scoreColors = getScoreColor(score);

  // Perfect score (100%) triggers confetti
  const isPerfectScore = score === 100;
  const canShowRetry = canRetry() && !isRetryMode;
  const allWrongWords = new Set([...globalErrorWords, ...sectionErrorWords]);
  const wrongWordsCount = allWrongWords.size;
  const totalQuestions = allGameWords.length;

  const handleRetry = () => {
    startRetryMode();
    generateRetrySession();
  };

  const handleGameRestart = () => {
    // Use the reusable function with section index reset
    if (!categoryId) return;

    initializeGame({
      categoryId,
      level,
      selectedVocabularyIds,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confetti for perfect scores */}
      <Confetti isPerfectScore={isPerfectScore} />

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
                : "Congratulations on completing the vocabulary exercise!"}
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

          {/* Score Breakdown */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Correct:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">{correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span>Wrong:</span>
              <span className="text-red-600 dark:text-red-400 font-medium">{wrongWordsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{totalQuestions}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {/* Retry Button - only show if there are wrong words and not in retry mode */}
            {canShowRetry && (
              <Button
                onClick={handleRetry}
                variant="default"
                className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white"
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
            <Link href={selectedVocabularyParam && categoryId && level ? `/vocabulary/lesson?categoryId=${categoryId}&level=${level}` : "/"} className="w-full">
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