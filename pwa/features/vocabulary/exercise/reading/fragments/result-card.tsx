import React from "react";
import { Card } from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { Confetti } from "@/pwa/core/components/confetti";

interface ResultCardProps {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  canRetry: boolean;
  onRestart: () => void;
  onRetry: () => void;
  onBackToHome: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  score,
  correctAnswers,
  wrongAnswers,
  totalQuestions,
  canRetry,
  onRestart,
  onRetry,
  onBackToHome,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! 🌟";
    if (score >= 80) return "Great job! 👏";
    if (score >= 70) return "Good work! 👍";
    if (score >= 60) return "Not bad! 📚";
    return "Keep practicing! 💪";
  };

  return (
    <>
      {score >= 80 && <Confetti isPerfectScore={score === 100} />}
      <Card className="p-8 text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Exercise Complete!
          </h2>
          
          <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          
          <p className="text-lg text-muted-foreground">
            {getScoreMessage(score)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {correctAnswers}
            </div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {wrongAnswers}
            </div>
            <div className="text-sm text-muted-foreground">Wrong</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {totalQuestions}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>

        <div className="space-y-3">
          {canRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full"
            >
              🔄 Retry Wrong Answers
            </Button>
          )}
          
          <Button
            onClick={onRestart}
            variant="outline"
            className="w-full"
          >
            🎯 Try Again
          </Button>
          
          <Button
            onClick={onBackToHome}
            className="w-full"
          >
            🏠 Back to Home
          </Button>
        </div>
      </Card>
    </>
  );
};