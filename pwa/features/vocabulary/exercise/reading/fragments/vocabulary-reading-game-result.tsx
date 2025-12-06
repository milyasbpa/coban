"use client";

import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { RotateCcw, PenLine, Link2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

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
  const { user, isAuthenticated } = useLoginStore();
  const { currentUserScore, getExerciseProgress, initializeUser } = useVocabularyScoreStore();

  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";
  const selectedVocabularyParam = searchParams.get("selectedVocabulary");

  const selectedVocabularyIds = useMemo(() => {
    return selectedVocabularyParam
      ? selectedVocabularyParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : undefined;
  }, [selectedVocabularyParam]);

  const {
    gameState: { score, isRetryMode },
    getCorrectAnswers,
    getWrongAnswers,
    getTotalQuestions,
    canRetry,
    startRetryMode,
    restartGame,
  } = useVocabularyReadingExerciseStore();

  // Initialize user score
  useEffect(() => {
    if (isAuthenticated && user?.uid && !currentUserScore) {
      initializeUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
    }
  }, [isAuthenticated, user, currentUserScore, level, initializeUser]);

  // Calculate exercise progress
  const exerciseProgress = useMemo(() => {
    if (!categoryId || !currentUserScore) {
      return { writing: 0, pairing: 0 };
    }

    if (selectedVocabularyIds && selectedVocabularyIds.length > 0) {
      const categoryData = VocabularyService.getVocabularyByCategory(
        parseInt(categoryId),
        level
      );
      if (!categoryData) return { writing: 0, pairing: 0 };

      const categoryMastery = currentUserScore.vocabularyMastery[level]?.[categoryId];
      if (!categoryMastery) return { writing: 0, pairing: 0 };

      let writingCompleted = 0;
      let pairingCompleted = 0;

      selectedVocabularyIds.forEach((vocabId) => {
        const mastery = categoryMastery[vocabId.toString()];
        if (mastery) {
          if (mastery.exerciseScores.writing > 0) writingCompleted++;
          if (mastery.exerciseScores.pairing > 0) pairingCompleted++;
        }
      });

      const total = selectedVocabularyIds.length;
      return {
        writing: Math.round((writingCompleted / total) * 100),
        pairing: Math.round((pairingCompleted / total) * 100),
      };
    }

    return {
      writing: getExerciseProgress("writing", categoryId, level),
      pairing: getExerciseProgress("pairing", categoryId, level),
    };
  }, [categoryId, level, selectedVocabularyIds, currentUserScore, getExerciseProgress]);

  const scoreColors = getScoreColor(score);
  const isPerfectScore = score === 100;
  const canShowRetry = canRetry() && !isRetryMode;
  const wrongWordsCount = getWrongAnswers();
  const correctAnswers = getCorrectAnswers();
  const totalQuestions = getTotalQuestions();

  const handleRetry = () => {
    startRetryMode();
  };

  const handleGameRestart = () => {
    restartGame();
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleNavigateToExercise = (exerciseType: "writing" | "pairing") => {
    if (!categoryId) return;

    const baseUrl = `/vocabulary/exercise/${exerciseType}`;
    const params = new URLSearchParams({
      categoryId,
      level,
    });

    if (selectedVocabularyParam) {
      params.append("selectedVocabulary", selectedVocabularyParam);
    }

    router.push(`${baseUrl}?${params.toString()}`);
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

          {/* Continue to Other Exercises */}
          <div className="space-y-3 pt-4">
            <div className="text-sm font-medium text-foreground">
              Continue to Other Exercises
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Writing Exercise */}
              <button
                onClick={() => handleNavigateToExercise("writing")}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border-2 border-border hover:border-primary hover:bg-accent transition-all duration-200 group"
              >
                <PenLine className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">
                  Writing
                </span>
                <span className={`text-sm font-bold ${getScoreColor(exerciseProgress.writing).text}`}>
                  {exerciseProgress.writing}%
                </span>
              </button>

              {/* Pairing Exercise */}
              <button
                onClick={() => handleNavigateToExercise("pairing")}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border-2 border-border hover:border-primary hover:bg-accent transition-all duration-200 group"
              >
                <Link2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">
                  Pairing
                </span>
                <span className={`text-sm font-bold ${getScoreColor(exerciseProgress.pairing).text}`}>
                  {exerciseProgress.pairing}%
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-border">
            {/* Retry Button - only show if there are wrong answers and not in retry mode */}
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