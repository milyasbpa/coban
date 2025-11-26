"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/pwa/core/components/sheet";
import { Button } from "@/pwa/core/components/button";
import { cn } from "@/pwa/core/lib/utils";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { calculateScore } from "../utils/vocabulary-reading.utils";
import { useVocabularyExerciseSearchParams } from "../../utils/hooks";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";

export function VocabularyAnswerBottomSheet() {
  const {
    questionState: { showBottomSheet, currentResult },
    getCurrentQuestion,
    getIsCurrentAnswerCorrect,
    handleNextQuestion,
  } = useVocabularyReadingExerciseStore();

  const { level, categoryId } = useVocabularyExerciseSearchParams();
  const { language } = useLanguage();

  const currentQuestion = getCurrentQuestion();
  const isCorrect = getIsCurrentAnswerCorrect();

  const onNext = () => {
    if (!categoryId) return;
    handleNextQuestion(calculateScore, level, categoryId);
  };

  if (!currentResult || !currentQuestion) return null;

  // Get meaning based on current language
  const meaning = language === 'id' 
    ? currentQuestion.word.meanings.id 
    : currentQuestion.word.meanings.en;

  return (
    <Sheet open={showBottomSheet} onOpenChange={() => {}}>
      <SheetContent
        side="bottom"
        className={cn(
          "min-h-[300px] rounded-t-xl [&>button]:hidden",
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
          {/* Vocabulary Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-foreground mb-2">
              {currentQuestion.japanese}
            </div>
            {currentQuestion.hiragana && (
              <div className="text-lg text-muted-foreground">
                {currentQuestion.hiragana}
              </div>
            )}
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
                {meaning}
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
