"use client";

import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { RotateCcw, Home, PenLine, Link2 } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useReadingExerciseStore } from "../store";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { getScoreColor } from "../../pairing/utils";
import { useEffect, useMemo } from "react";

export function ReadingGameResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useLoginStore();
  const { currentUserScore, getExerciseProgress, initializeUser } = useKanjiScoreStore();

  const lessonId = searchParams.get("lessonId");
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

  // Initialize user score
  useEffect(() => {
    if (isAuthenticated && user?.uid && !currentUserScore) {
      initializeUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
    }
  }, [isAuthenticated, user, currentUserScore, level, initializeUser]);

  // Calculate exercise progress
  const exerciseProgress = useMemo(() => {
    if (!lessonId || !currentUserScore) {
      return { writing: 0, pairing: 0 };
    }

    // If specific kanji are selected, manually calculate progress for those kanji only
    if (selectedKanjiIds && selectedKanjiIds.length > 0) {
      let writingCompleted = 0;
      let pairingCompleted = 0;

      selectedKanjiIds.forEach((kanjiId) => {
        const kanjiMastery = currentUserScore.kanjiMastery[level]?.[kanjiId.toString()];
        if (kanjiMastery) {
          // Check if any word in this kanji has completed the exercise
          const words = Object.values(kanjiMastery.words);
          const hasWriting = words.some((word) => word.exerciseScores.writing > 0);
          const hasPairing = words.some((word) => word.exerciseScores.pairing > 0);
          
          if (hasWriting) writingCompleted++;
          if (hasPairing) pairingCompleted++;
        }
      });

      const total = selectedKanjiIds.length;
      return {
        writing: Math.round((writingCompleted / total) * 100),
        pairing: Math.round((pairingCompleted / total) * 100),
      };
    }

    // Otherwise, use the store function for full lesson progress
    return {
      writing: getExerciseProgress("writing", lessonId, level),
      pairing: getExerciseProgress("pairing", lessonId, level),
    };
  }, [lessonId, level, selectedKanjiIds, currentUserScore, getExerciseProgress]);

  const handleRestart = () => {
    restartGame();
  };

  // Determine back URL based on route context
  const getBackUrl = () => {
    // If coming from exercise with selectedKanji, go back to lesson
    if (selectedKanjiParam && lessonId && level) {
      return `/kanji/lesson?lessonId=${lessonId}&level=${level}`;
    }

    // Default back to home
    return "/";
  };

  const handleNavigateToExercise = (exerciseType: "writing" | "pairing") => {
    if (!lessonId) return;

    const baseUrl = `/kanji/exercise/${exerciseType}`;
    const params = new URLSearchParams({ level });

    params.append("lessonId", lessonId);

    if (selectedKanjiParam) {
      params.append("selectedKanji", selectedKanjiParam);
    }

    router.push(`${baseUrl}?${params.toString()}`);
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

            <Link href={getBackUrl()} className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
