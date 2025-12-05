"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { getScoreColor } from "../../utils/score-colors";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { integrateVocabularyWritingExerciseScore } from "../utils/scoring-integration";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";

export const VocabularyWritingGameResult = () => {
  const router = useRouter();
  const store = useVocabularyWritingExerciseStore();
  const { user, isAuthenticated } = useLoginStore();
  const { refreshUserScore } = useVocabularyScoreStore();

  const [isScoreIntegrated, setIsScoreIntegrated] = useState(false);

  const score = store.gameState.score;
  const totalQuestions = store.getTotalQuestions();
  const wrongAnswers = store.getWrongAnswers();
  const correctAnswers = store.getCorrectAnswers();
  const level = store.gameState.level;
  const categoryId = store.gameState.categoryId;
  const isRetryMode = store.gameState.isRetryMode;

  // Score is already in percentage (0-100), no need to calculate again
  const isPerfectScore = score === 100;
  const scoreColors = getScoreColor(score);

  // Integrate score with vocabulary scoring system (only once)
  useEffect(() => {
    const integrateScore = async () => {
      if (isScoreIntegrated) return;
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        const allQuestions = store.gameState.questions;
        const wrongQuestions = store.gameState.wrongQuestions;
        const correctQuestions = store.gameState.correctQuestions;

        await integrateVocabularyWritingExerciseScore(
          allQuestions,
          wrongQuestions,
          correctQuestions,
          level,
          categoryId,
          user.uid
        );

        // Refresh score store to update UI
        await refreshUserScore();
        setIsScoreIntegrated(true);
      } catch (error) {
        console.error(
          "❌ Failed to integrate vocabulary writing exercise score:",
          error
        );
      }
    };

    integrateScore();
  }, [
    isAuthenticated,
    user,
    isScoreIntegrated,
    level,
    categoryId,
    store.gameState,
    refreshUserScore,
  ]);

  const handleRetry = () => {
    store.startRetryMode();
  };

  const handlePlayAgain = () => {
    store.restartGame();
  };

  const handleBack = () => {
    router.back();
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
              <span className="text-green-600 dark:text-green-400 font-medium">
                {correctAnswers}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Wrong:</span>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {wrongAnswers}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{totalQuestions}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {store.canRetry() && !isRetryMode && (
              <Button
                onClick={handleRetry}
                className="w-full"
                variant="default"
                size="lg"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Wrong Questions ({wrongAnswers})
              </Button>
            )}

            <Button
              onClick={handlePlayAgain}
              className="w-full"
              variant={store.canRetry() && !isRetryMode ? "outline" : "default"}
              size="lg"
            >
              Play Again
            </Button>

            <Button
              onClick={handleBack}
              className="w-full"
              variant="outline"
              size="lg"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
