"use client";

import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { RotateCcw, Home } from "lucide-react";

import { useRouter } from "next/navigation";
import { useReadingExerciseStore } from "../store";
import { getScoreColor } from "../../pairing/utils";

export function ReadingGameResult() {
  const router = useRouter();

  // Get data from store instead of props
  const {
    gameState: { isRetryMode, score },
    getTotalQuestions,
    getWrongAnswers,
    getCorrectAnswers,
    restartGame,
    canRetry,
    startRetryMode,
    getWrongQuestions,
  } = useReadingExerciseStore();

  const handleRestart = () => {
    restartGame();
  };

  const handleBackToHome = () => {
    router.back();
  };

  const handleRetry = () => {
    startRetryMode();
  };

  const correctAnswers = getCorrectAnswers();
  const wrongAnswers = getWrongAnswers();
  const totalQuestions = getTotalQuestions();
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const scoreColors = getScoreColor(score);

  // Perfect score (100%) triggers confetti
  const isPerfectScore = accuracy === 100 && wrongAnswers === 0;
  const showRetryButton = canRetry() && !isRetryMode;

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confetti for perfect scores */}
      <Confetti isPerfectScore={isPerfectScore} />

      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {isPerfectScore ? "Perfect Reading! 🎉" : "Great Job! 📚"}
            </h1>
            <p className="text-muted-foreground">
              {isPerfectScore
                ? "Amazing! You got all readings correct!"
                : "Congratulations on completing the reading exercise!"}
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
            {/* Retry Button - only show if there are wrong questions and not in retry mode */}
            {showRetryButton && (
              <Button
                onClick={handleRetry}
                variant="default"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Wrong Questions ({getWrongQuestions().length})
              </Button>
            )}

            <Button
              onClick={handleRestart}
              variant={showRetryButton ? "outline" : "default"}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
