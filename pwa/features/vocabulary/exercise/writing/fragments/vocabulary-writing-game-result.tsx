"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { getScoreColor } from "@/pwa/features/kanji/exercise/pairing/utils/score-colors";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { integrateVocabularyWritingExerciseScore } from "../utils/scoring-integration";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";

export const VocabularyWritingGameResult = () => {
  const router = useRouter();
  const store = useVocabularyWritingExerciseStore();
  const { user, isAuthenticated } = useLoginStore();
  const { refreshUserScore } = useVocabularyScoreStore();

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isScoreIntegrated, setIsScoreIntegrated] = useState(false);
  
  const score = store.gameState.score;
  const totalQuestions = store.getTotalQuestions();
  const wrongAnswers = store.getWrongAnswers();
  const correctAnswers = store.getCorrectAnswers();
  const level = store.gameState.level;
  const categoryId = store.gameState.categoryId;
  
  const accuracy = Math.round((score / totalQuestions) * 100);
  const isPerfectScore = accuracy === 100;
  const scoreColors = getScoreColor(accuracy);

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Integrate score with vocabulary scoring system (only once)
  useEffect(() => {
    const integrateScore = async () => {
      if (isScoreIntegrated) return;
      if (!isAuthenticated || !user) {
        console.log("⚠️ Guest user - score not saved");
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
        
        console.log("✅ Vocabulary writing exercise score integrated successfully");
      } catch (error) {
        console.error("❌ Failed to integrate vocabulary writing exercise score:", error);
      }
    };

    integrateScore();
  }, [isAuthenticated, user, isScoreIntegrated, level, categoryId, store.gameState, refreshUserScore]);

  const handleRetry = () => {
    store.startRetryMode();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      {isPerfectScore && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <Card
        className={`w-full max-w-md p-8 ${scoreColors.bg} ${scoreColors.border} border-2`}
      >
        <div className="text-center space-y-6">
          <h2 className={`text-2xl font-bold ${scoreColors.textSecondary}`}>
            Quiz Complete!
          </h2>

          <div className="space-y-2">
            <div className={`text-7xl font-bold ${scoreColors.text}`}>
              {accuracy}%
            </div>
            <p className={`text-lg ${scoreColors.textSecondary}`}>
              {score} out of {totalQuestions} correct
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {correctAnswers}
              </div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {wrongAnswers}
              </div>
              <p className="text-sm text-muted-foreground">Wrong</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {store.canRetry() && (
              <Button
                onClick={handleRetry}
                className="w-full"
                variant="default"
                size="lg"
              >
                Retry Wrong Questions ({wrongAnswers})
              </Button>
            )}

            <Button
              onClick={handleBack}
              className="w-full"
              variant="outline"
              size="lg"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
