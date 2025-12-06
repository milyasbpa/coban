"use client";

import { useMemo, useEffect } from "react";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Confetti } from "@/pwa/core/components/confetti";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { getScoreColor } from "../../utils/score-colors";
import { RotateCcw, PenLine, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export function VocabularyPairingGameResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";
  const selectedVocabularyParam = searchParams.get("selectedVocabulary");

  const { user, isAuthenticated } = useLoginStore();
  const { currentUserScore, getExerciseProgress, initializeUser } = useVocabularyScoreStore();

  // Initialize user score on mount
  useEffect(() => {
    if (isAuthenticated && user?.uid && !currentUserScore) {
      initializeUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
    }
  }, [isAuthenticated, user, currentUserScore, level, initializeUser]);

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

  // Calculate exercise progress for writing and reading
  const exerciseProgress = useMemo(() => {
    console.log('[DEBUG] Calculating progress:', {
      categoryId,
      level,
      currentUserScore: currentUserScore ? 'exists' : 'null',
      selectedVocabularyIds,
    });

    if (!categoryId || !currentUserScore) {
      console.log('[DEBUG] Missing data - returning 0');
      return { writing: 0, reading: 0 };
    }

    // If selectedVocabulary exists, calculate progress only for those words
    if (selectedVocabularyIds && selectedVocabularyIds.length > 0) {
      console.log('[DEBUG] Using selectedVocabulary calculation');
      const categoryData = VocabularyService.getVocabularyByCategory(
        parseInt(categoryId),
        level
      );
      if (!categoryData) {
        console.log('[DEBUG] Category data not found');
        return { writing: 0, reading: 0 };
      }

      const categoryMastery = currentUserScore.vocabularyMastery[level]?.[categoryId];
      console.log('[DEBUG] Category mastery:', categoryMastery ? 'exists' : 'not found');
      
      if (!categoryMastery) return { writing: 0, reading: 0 };

      let writingCompleted = 0;
      let readingCompleted = 0;

      selectedVocabularyIds.forEach((vocabId) => {
        const mastery = categoryMastery[vocabId.toString()];
        if (mastery) {
          console.log(`[DEBUG] Vocab ${vocabId}:`, mastery.exerciseScores);
          if (mastery.exerciseScores.writing > 0) writingCompleted++;
          if (mastery.exerciseScores.reading > 0) readingCompleted++;
        }
      });

      const total = selectedVocabularyIds.length;
      const result = {
        writing: Math.round((writingCompleted / total) * 100),
        reading: Math.round((readingCompleted / total) * 100),
      };
      console.log('[DEBUG] Selected vocab result:', result);
      return result;
    }

    // Otherwise, use the full category progress
    console.log('[DEBUG] Using full category calculation');
    const result = {
      writing: getExerciseProgress("writing", categoryId, level),
      reading: getExerciseProgress("reading", categoryId, level),
    };
    console.log('[DEBUG] Full category result:', result);
    return result;
  }, [categoryId, level, selectedVocabularyIds, currentUserScore, getExerciseProgress]);

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

  const handleNavigateToExercise = (exerciseType: "writing" | "reading") => {
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
          <div className="space-y-3 pt-4 border-t border-border">{/* Retry Button - only show if there are wrong words and not in retry mode */}
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