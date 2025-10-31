"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/pwa/core/components/sheet";
import { Button } from "@/pwa/core/components/button";
import { AnswerResult } from "../utils/reading-game";
import { cn } from "@/pwa/core/lib/utils";

interface AnswerBottomSheetProps {
  isOpen: boolean;
  result: AnswerResult | null;
  onNext: () => void;
}

export function AnswerBottomSheet({ isOpen, result, onNext }: AnswerBottomSheetProps) {
  if (!result) return null;

  return (
    <Sheet open={isOpen} onOpenChange={() => {}}>
      <SheetContent 
        side="bottom" 
        className={cn(
          "h-[300px] rounded-t-xl",
          result.isCorrect 
            ? "bg-green-50 border-green-200" 
            : "bg-red-50 border-red-200"
        )}
      >
        <SheetHeader className="text-center space-y-4">
          <SheetTitle className={cn(
            "text-2xl font-bold",
            result.isCorrect ? "text-green-800" : "text-red-800"
          )}>
            {result.isCorrect ? "Correct! 🎉" : "Incorrect ❌"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Kanji Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-foreground mb-2">
              {result.kanji}
            </div>
            <div className="text-lg text-muted-foreground">
              {result.furigana}
            </div>
          </div>

          {/* Answer Comparison */}
          <div className="bg-background/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your answer:</span>
              <span className={cn(
                "font-semibold",
                result.isCorrect ? "text-green-600" : "text-red-600"
              )}>
                {result.userAnswer}
              </span>
            </div>
            {!result.isCorrect && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Correct answer:</span>
                <span className="font-semibold text-green-600">
                  {result.correctAnswer}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Meaning:</span>
              <span className="font-semibold text-foreground">
                {result.meaning}
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