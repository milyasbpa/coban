"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/pwa/core/components/sheet";
import { Button } from "@/pwa/core/components/button";
import { cn } from "@/pwa/core/lib/utils";
import { useReadingExerciseStore } from "../store";
import { calculateReadingScore } from "../utils/reading-game";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { useExerciseSearchParams } from "../../utils/hooks";

export function AnswerBottomSheet() {
  const {
    questionState: { showBottomSheet, currentResult },
    getCurrentQuestion,
    getIsCurrentAnswerCorrect,
    handleNextQuestion,
  } = useReadingExerciseStore();

  const { user } = useLoginStore();
  const {
    updateKanjiMastery,
    initializeUser,
    currentUserScore,
    isInitialized,
  } = useKanjiScoreStore();

  const { level } = useExerciseSearchParams();

  const currentQuestion = getCurrentQuestion();
  const isCorrect = getIsCurrentAnswerCorrect();

  const onNext = () => {
    handleNextQuestion(
      calculateReadingScore,
      level,
      updateKanjiMastery,
      initializeUser,
      isInitialized,
      currentUserScore,
      user?.uid || null
    );
  };
  if (!currentResult || !currentQuestion) return null;

  return (
    <Sheet open={showBottomSheet} onOpenChange={() => {}}>
      <SheetContent
        side="bottom"
        className={cn(
          "min-h-[300px] rounded-t-xl",
          isCorrect
            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
        )}
      >
        <SheetHeader className="text-center space-y-4">
          <SheetTitle
            className={cn(
              "text-2xl font-bold",
              isCorrect ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
            )}
          >
            {isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Kanji Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-foreground mb-2">
              {currentQuestion.word}
            </div>
            <div className="text-lg text-muted-foreground">
              {currentQuestion.furigana}
            </div>
          </div>

          {/* Answer Comparison */}
          <div className="bg-background/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Result:</span>
              <span
                className={cn(
                  "font-semibold",
                  isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Meaning:</span>
              <span className="font-semibold text-foreground">
                {currentQuestion.meanings.id}
              </span>
            </div>
          </div>

          {/* Next Button */}
          <div className="px-6 py-4">
            <Button onClick={onNext} className="w-full h-12 text-lg">
              Continue
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
