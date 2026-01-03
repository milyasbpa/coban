"use client";

import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { RotateCcw, Home, BookOpen, Link2 } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useWritingExerciseStore } from "../store/writing-exercise.store";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { getScoreColor } from "../../pairing/utils";
import { useEffect, useMemo } from "react";

export function WritingGameResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useLoginStore();
  const { currentUserScore, getExerciseProgress, initializeUser } = useKanjiScoreStore();

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  // Get data from store instead of props
  const {
    gameState: { isRetryMode, score },
    getTotalQuestions,
    getWrongAnswers,
    getCorrectAnswers,
    resetExercise,
    canRetry,
    startRetryMode,
    getWrongQuestions,
  } = useWritingExerciseStore();

  // Initialize user score
  useEffect(() => {
    if (isAuthenticated && user?.uid && !currentUserScore) {
      initializeUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
    }
  }, [isAuthenticated, user, currentUserScore, level, initializeUser]);

  // Calculate exercise progress
  const exerciseProgress = useMemo(() => {
    if (!lessonId || !currentUserScore) {
      return { reading: 0, pairing: 0 };
    }

    return {
      reading: getExerciseProgress("reading", lessonId, level),
      pairing: getExerciseProgress("pairing", lessonId, level),
    };
  }, [lessonId, level, currentUserScore, getExerciseProgress]);

  const handleRestart = () => {
    resetExercise();
  };

  const handleBackToHome = () => {
    router.back();
  };

  const handleNavigateToExercise = (exerciseType: "reading" | "pairing") => {
    if (!lessonId) return;

    const baseUrl = `/kanji/exercise/${exerciseType}`;
    const params = new URLSearchParams({ level });

    params.append("lessonId", lessonId);

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
              {isPerfectScore ? "Perfect Writing! 🎉" : "Great Job! ✍️"}
            </h1>
            <p className="text-muted-foreground">
              {isPerfectScore
                ? "Amazing! You got all writings correct!"
                : "Congratulations on completing the writing exercise!"}
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