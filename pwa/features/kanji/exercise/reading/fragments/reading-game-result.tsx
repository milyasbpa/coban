"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { RotateCcw, Home } from "lucide-react";
import { useWindowSize } from "usehooks-ts";

import { useRouter } from "next/navigation";
import { useReadingExerciseStore } from "../store";

const getScoreColor = (score: number) => {
  if (score >= 80) {
    return {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      textSecondary: "text-green-600"
    };
  } else if (score >= 60) {
    return {
      bg: "bg-yellow-50",
      border: "border-yellow-200", 
      text: "text-yellow-700",
      textSecondary: "text-yellow-600"
    };
  } else {
    return {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700", 
      textSecondary: "text-red-600"
    };
  }
};

export function ReadingGameResult() {
  const router = useRouter();
  
  // Get data from store instead of props
  const { 
    gameStats, 
    restartGame, 
    canRetry, 
    startRetryMode,
    isRetryMode,
    getWrongQuestions
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
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { totalQuestions, correctAnswers, wrongAnswers, score } = gameStats;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const scoreColors = getScoreColor(score);
  
  // Perfect score (100%) triggers confetti
  const isPerfectScore = accuracy === 100 && wrongAnswers === 0;
  const showRetryButton = canRetry() && !isRetryMode;
  
  useEffect(() => {
    // Show confetti for perfect scores
    if (isPerfectScore) {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPerfectScore]);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confetti for perfect scores */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
          gravity={0.1}
        />
      )}

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

          {/* Statistics */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Correct Answers:</span>
              <span className="font-semibold text-foreground">
                {correctAnswers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="font-semibold text-foreground">
                {totalQuestions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wrong Answers:</span>
              <span className="font-semibold text-foreground">
                {wrongAnswers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accuracy:</span>
              <span className={`font-semibold ${scoreColors.text}`}>
                {accuracy}%
              </span>
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