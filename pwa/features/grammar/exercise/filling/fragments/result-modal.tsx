"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/pwa/core/components/dialog";
import { Button } from "@/pwa/core/components/button";
import { Trophy, RotateCcw, Home, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { useGrammarScoreStore } from "@/pwa/features/score/store/grammar-score.store";

interface ResultModalProps {
  isOpen: boolean;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  onRestart: () => void;
  onClose: () => void;
}

export function ResultModal({
  isOpen,
  score,
  correctCount,
  wrongCount,
  totalQuestions,
  onRestart,
  onClose,
}: ResultModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";
  
  // Get pattern progress from store
  const { getPatternProgress } = useGrammarScoreStore();
  const patternProgress = patternId ? getPatternProgress(patternId, level) : 0;
  
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastVisitedCategory", "grammar");
    }
    router.push("/");
  };

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return { emoji: "🎉", text: "Excellent!", color: "text-green-600" };
    if (accuracy >= 70) return { emoji: "👏", text: "Great Job!", color: "text-blue-600" };
    if (accuracy >= 50) return { emoji: "👍", text: "Good Effort!", color: "text-orange-600" };
    return { emoji: "💪", text: "Keep Practicing!", color: "text-red-600" };
  };

  const performance = getPerformanceMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Exercise Complete!
          </DialogTitle>
          <DialogDescription className="text-center">
            Here's how you performed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Performance Message */}
          <div className="text-center space-y-2">
            <div className="text-6xl">{performance.emoji}</div>
            <p className={`text-xl font-bold ${performance.color}`}>
              {performance.text}
            </p>
          </div>

          {/* Score */}
          <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg">
            <Trophy className="w-8 h-8 text-primary" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Score</p>
              <p className="text-3xl font-bold text-primary">{score}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Correct */}
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {correctCount}
              </p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>

            {/* Wrong */}
            <div className="p-3 bg-red-500/10 rounded-lg text-center">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {wrongCount}
              </p>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>

            {/* Accuracy */}
            <div className="p-3 bg-blue-500/10 rounded-lg text-center">
              <Trophy className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {accuracy}%
              </p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>

          {/* Pattern Progress */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Pattern Progress</p>
              </div>
              <p className="text-lg font-bold text-primary">{Math.round(patternProgress)}%</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${patternProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Keep practicing to master this pattern!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              className="w-full py-6 text-base font-medium"
              onClick={onRestart}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Again
            </Button>

            <Button
              variant="outline"
              className="w-full py-6 text-base font-medium"
              onClick={handleGoHome}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
