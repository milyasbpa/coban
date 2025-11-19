"use client";

import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

function getScoreColor(score: number) {
  if (score >= 90) {
    return {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      textSecondary: 'text-green-800 dark:text-green-300'
    };
  } else if (score >= 80) {
    return {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20', 
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      textSecondary: 'text-yellow-800 dark:text-yellow-300'
    };
  } else {
    return {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800', 
      text: 'text-red-600 dark:text-red-400',
      textSecondary: 'text-red-800 dark:text-red-300'
    };
  }
}

export function VocabularyReadingGameResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";

  const {
    gameState: { score, isRetryMode },
    getCorrectAnswers,
    getWrongAnswers,
    getTotalQuestions,
    canRetry,
    startRetryMode,
    restartGame,
    initializeExercise,
  } = useVocabularyReadingExerciseStore();

  const scoreColors = getScoreColor(score);
  const isPerfectScore = score === 100;
  const canShowRetry = canRetry() && !isRetryMode;
  const wrongWordsCount = getWrongAnswers();
  const correctAnswers = getCorrectAnswers();
  const totalQuestions = getTotalQuestions();

  const handleRetry = () => {
    startRetryMode();
  };

  const handleGameRestart = async () => {
    if (!categoryId) return;
    
    restartGame();
    await initializeExercise(level, categoryId);
  };

  const handleBackToHome = () => {
    router.push("/");
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
                : "Great Job! 🎉"}
            </h1>
            <p className="text-muted-foreground">
              {isRetryMode
                ? `Retry completed with final score!`
                : isPerfectScore
                ? "Amazing! You got everything right!"
                : "Congratulations on completing the vocabulary reading exercise!"}
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
              <span className="text-green-600 font-medium">{correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span>Wrong:</span>
              <span className="text-red-600 font-medium">{wrongWordsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{totalQuestions}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {/* Retry Button - only show if there are wrong answers and not in retry mode */}
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
            
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}