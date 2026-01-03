"use client";

import { useMemo, useEffect } from "react";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { usePairingGameStore } from "../store/pairing-game.store";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { getScoreColor } from "../utils/score-colors";
import { RotateCcw, PenLine, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export function PairingGameResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const {
    canRetry,
    startRetryMode,
    generateRetrySession,
    gameState: { isRetryMode, score, errorWords: globalErrorWords },
    sectionState: { errorWords: sectionErrorWords },
    initializeGame,
  } = usePairingGameStore();

  // Initialize user score
  useEffect(() => {
    if (isAuthenticated && user?.uid && !currentUserScore) {
      initializeUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
    }
  }, [isAuthenticated, user, currentUserScore, level, initializeUser]);

  // Calculate exercise progress
  const exerciseProgress = useMemo(() => {
    if (!lessonId || !currentUserScore) {
      return { writing: 0, reading: 0 };
    }

    return {
      writing: getExerciseProgress("writing", lessonId, level),
      reading: getExerciseProgress("reading", lessonId, level),
    };
  }, [lessonId, level, currentUserScore, getExerciseProgress]);

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
    if (!lessonId) return;

    initializeGame({
      lessonId: parseInt(lessonId),
      level,
      shouldResetSectionIndex: true,
      selectedKanjiIds,
    });
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

  const handleNavigateToExercise = (exerciseType: "writing" | "reading") => {
    if (!lessonId) return;

    const baseUrl = `/kanji/exercise/${exerciseType}`;
    const params = new URLSearchParams({ level });

    params.append("lessonId", lessonId);

    if (selectedKanjiParam) {
      params.append("selectedKanji", selectedKanjiParam);
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-border">
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
            <Link href={getBackUrl()} className="w-full">
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
