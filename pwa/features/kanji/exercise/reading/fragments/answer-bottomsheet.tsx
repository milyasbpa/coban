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
import { KanjiContextSection } from "@/pwa/core/components/kanji-context-section";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function AnswerBottomSheet() {
  const [showContext, setShowContext] = useState(true);
  
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
        className="rounded-t-xl bg-popover p-0"
        aria-describedby="kanji-answer-description"
      >
        <SheetTitle className="sr-only">
          {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
        </SheetTitle>
        {/* Scrollable Content Area */}
        <div className="max-w-sm mx-auto space-y-3 max-h-[80vh] overflow-y-auto p-4 pb-20">
          {/* Hidden description for accessibility */}
          <p id="kanji-answer-description" className="sr-only">
            Your answer was {isCorrect ? 'correct' : 'incorrect'}. The kanji word is {currentQuestion.word} read as {currentQuestion.furigana}.
          </p>
          
          {/* Header with Icon and Status */}
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
            <div className="flex-1">
              <p className={cn(
                'font-medium',
                isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              )}>
                {isCorrect ? 'Correct!' : 'Incorrect!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isCorrect 
                  ? 'Your answer is correct!' 
                  : 'Check the reading pattern below.'
                }
              </p>
            </div>
          </div>

          {/* Kanji Display - Smaller like Writing */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {currentQuestion.word}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentQuestion.furigana}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Meaning:</div>
                <div className="text-sm font-semibold text-foreground">
                  {currentQuestion.meanings.id}
                </div>
              </div>
            </div>
          </div>

          {/* Context Expansion Section */}
          {currentQuestion && (
            <div className="space-y-2">
              <button
                onClick={() => setShowContext(!showContext)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-sm font-medium">
                  📚 Learn more about this kanji
                </span>
                {showContext ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showContext && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <KanjiContextSection
                    kanjiId={currentQuestion.kanjiId}
                    wordFurigana={currentQuestion.furigana}
                    level={level}
                    isCorrect={isCorrect}
                    compact={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Continue Button at Bottom */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-popover border-t border-border">
          <div className="max-w-sm mx-auto">
            <Button 
              onClick={onNext} 
              className="w-full"
              variant={isCorrect ? "default" : "secondary"}
            >
              Continue
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
