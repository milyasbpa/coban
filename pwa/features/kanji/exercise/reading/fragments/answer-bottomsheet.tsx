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
  const { showBottomSheet, currentResult, handleNextQuestion } = useReadingExerciseStore();
  
  const onNext = () => {
    handleNextQuestion(calculateReadingScore);
  };
  
  if (!currentResult) return null;

  return (
    <Sheet open={showBottomSheet} onOpenChange={() => {}}>
      <SheetContent 
        side="bottom" 
        className={cn(
          "h-[300px] rounded-t-xl",
          currentResult.isCorrect 
            ? "bg-green-50 border-green-200" 
            : "bg-red-50 border-red-200"
        )}
      >
        <SheetHeader className="text-center space-y-4">
          <SheetTitle className={cn(
            "text-2xl font-bold",
            currentResult.isCorrect ? "text-green-800" : "text-red-800"
          )}>
            {currentResult.isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Kanji Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-foreground mb-2">
              {currentResult.kanji}
            </div>
            <div className="text-lg text-muted-foreground">
              {currentResult.furigana}
            </div>
          </div>

          {/* Answer Comparison */}
          <div className="bg-background/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your answer:</span>
              <span className={cn(
                "font-semibold",
                currentResult.isCorrect ? "text-green-600" : "text-red-600"
              )}>
                {currentResult.userAnswer}
              </span>
            </div>
            {!currentResult.isCorrect && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Correct answer:</span>
                <span className="font-semibold text-green-600">
                  {currentResult.correctAnswer}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Meaning:</span>
              <span className="font-semibold text-foreground">
                {currentResult.meaning}
              </span>
            </div>
          </div>

          {/* Next Button */}
          <Button 
            onClick={onNext}
            className="w-full h-12 text-lg"
          >
            Continue
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}