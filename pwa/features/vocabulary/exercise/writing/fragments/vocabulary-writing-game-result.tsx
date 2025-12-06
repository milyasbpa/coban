"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { getScoreColor } from "../../utils/score-colors";
import { RotateCcw, BookOpen, Link2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { integrateVocabularyWritingExerciseScore } from "../utils/scoring-integration";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import Link from "next/link";

export const VocabularyWritingGameResult = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useVocabularyWritingExerciseStore();
  const { user, isAuthenticated } = useLoginStore();
  const { currentUserScore, getExerciseProgress, refreshUserScore, initializeUser } = useVocabularyScoreStore();

  const [isScoreIntegrated, setIsScoreIntegrated] = useState(false);

  const selectedVocabularyParam = searchParams.get("selectedVocabulary");

  const selectedVocabularyIds = useMemo(() => {
    return selectedVocabularyParam
      ? selectedVocabularyParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : undefined;
  }, [selectedVocabularyParam]);

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

  // Initialize user score
  useEffect(() => {
    if (isAuthenticated && user?.uid && !currentUserScore) {
      initializeUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
    }
  }, [isAuthenticated, user, currentUserScore, level, initializeUser]);

  // Calculate exercise progress
  const exerciseProgress = useMemo(() => {
    if (!categoryId || !currentUserScore) {
      return { reading: 0, pairing: 0 };
    }

    if (selectedVocabularyIds && selectedVocabularyIds.length > 0) {
      const categoryData = VocabularyService.getVocabularyByCategory(
        parseInt(categoryId),
        level
      );
      if (!categoryData) return { reading: 0, pairing: 0 };

      const categoryMastery = currentUserScore.vocabularyMastery[level]?.[categoryId];
      if (!categoryMastery) return { reading: 0, pairing: 0 };

      let readingCompleted = 0;
      let pairingCompleted = 0;

      selectedVocabularyIds.forEach((vocabId) => {
        const mastery = categoryMastery[vocabId.toString()];
        if (mastery) {
          if (mastery.exerciseScores.reading > 0) readingCompleted++;
          if (mastery.exerciseScores.pairing > 0) pairingCompleted++;
        }
      });

      const total = selectedVocabularyIds.length;
      return {
        reading: Math.round((readingCompleted / total) * 100),
        pairing: Math.round((pairingCompleted / total) * 100),
      };
    }

    return {
      reading: getExerciseProgress("reading", categoryId, level),
      pairing: getExerciseProgress("pairing", categoryId, level),
    };
  }, [categoryId, level, selectedVocabularyIds, currentUserScore, getExerciseProgress]);

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

  const handleNavigateToExercise = (exerciseType: "reading" | "pairing") => {
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

          {/* Continue to Other Exercises */}
          <div className="space-y-3 pt-4">
            <div className="text-sm font-medium text-foreground">
              Continue to Other Exercises
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Reading Exercise */}
              <button
                onClick={() => handleNavigateToExercise("reading")}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border-2 border-border hover:border-primary hover:bg-accent transition-all duration-200 group"
              >
                <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">
                  Reading
                </span>
                <span className={`text-sm font-bold ${getScoreColor(exerciseProgress.reading).text}`}>
                  {exerciseProgress.reading}%
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

            <Link href={selectedVocabularyParam && categoryId && level ? `/vocabulary/lesson?categoryId=${categoryId}&level=${level}` : "/"} className="w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
