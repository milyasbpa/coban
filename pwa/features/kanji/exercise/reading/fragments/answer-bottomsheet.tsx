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

export function AnswerBottomSheet() {
  const {
    questionState: { showBottomSheet, currentResult },
    getCurrentQuestion,
    getIsCurrentAnswerCorrect,
    handleNextQuestion,
  } = useReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();
  const isCorrect = getIsCurrentAnswerCorrect();

  const onNext = () => {
    handleNextQuestion(calculateReadingScore);
  };
  if (!currentResult || !currentQuestion) return null;

  return (
    <Sheet open={showBottomSheet} onOpenChange={() => {}}>
      <SheetContent
        side="bottom"
        className={cn(
          "min-h-[300px] rounded-t-xl",
          isCorrect
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        )}
      >
        <SheetHeader className="text-center space-y-4">
          <SheetTitle
            className={cn(
              "text-2xl font-bold",
              isCorrect ? "text-green-800" : "text-red-800"
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
                  isCorrect ? "text-green-600" : "text-red-600"
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
