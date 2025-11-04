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
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import { useSearchParams } from "next/navigation";
import type { QuestionResult } from "@/pwa/features/score/model/score";

export function AnswerBottomSheet() {
  const {
    showBottomSheet,
    currentResult,
    handleNextQuestion,
    gameStats,
    questions,
    isRetryMode,
    wrongQuestions,
  } = useReadingExerciseStore();

  const searchParams = useSearchParams();
  const {
    updateExerciseScore,
    updateKanjiMastery,
    initializeUser,
    currentUserScore,
    isInitialized,
  } = useScoreStore();

  // Get URL parameters for score tracking
  const lessonId = searchParams.get("lessonId");
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";

  const onNext = () => {
    const isLastQuestion =
      gameStats.currentQuestion === gameStats.totalQuestions;

    if (isLastQuestion) {
      // Integrate with Score System only on last question
      const integrateWithScoreSystem = async () => {
        // Auto-initialize user if not already initialized
        if (!isInitialized || !currentUserScore) {
          await initializeUser(
            "default-user",
            level as "N5" | "N4" | "N3" | "N2" | "N1"
          );
        }

        // Import required utilities for word-based scoring
        const { ScoreCalculator } = await import("@/pwa/features/score/utils/score-calculator");
        const { WordIdGenerator } = await import("@/pwa/features/score/utils/word-id-generator");
        const { KanjiWordMapper } = await import("@/pwa/features/score/utils/kanji-word-mapper");

        // Create word-based question results using accurate kanji mapping
        const currentQuestions = isRetryMode ? wrongQuestions : questions;
        const wordResults: QuestionResult[] = currentQuestions.map((question, index) => {
          // Determine if this question was answered correctly based on game stats
          const isCorrect = index < gameStats.correctAnswers;
          
          // Get accurate kanji information using mapper
          const kanjiInfo = KanjiWordMapper.getKanjiInfo(question.kanji, level);
          
          // Generate word ID for this word
          const wordId = WordIdGenerator.generateWordId(question.kanji, kanjiInfo.kanjiId, index);

          return {
            kanjiId: kanjiInfo.kanjiId,
            kanji: kanjiInfo.kanjiCharacter,
            isCorrect,
            wordId,
            word: question.kanji,
            exerciseType: "reading" as const,
          };
        });

        // Group results by kanji for word-based processing
        const resultsByKanji = wordResults.reduce((acc, result) => {
          if (!acc[result.kanjiId]) {
            acc[result.kanjiId] = [];
          }
          acc[result.kanjiId].push(result);
          return acc;
        }, {} as Record<string, QuestionResult[]>);

        // Update word-based scoring for each kanji
        Object.entries(resultsByKanji).forEach(([kanjiId, results]) => {
          // Get accurate total words for this kanji
          const firstWord = results[0]?.word;
          const totalWordsInKanji = firstWord ? KanjiWordMapper.getTotalWordsForKanji(firstWord, level) : 1;
          
          // Update each word's mastery
          results.forEach(result => {
            updateKanjiMastery(kanjiId, result.kanji, [result]);
          });
        });
      };

      // Call the integration function
      integrateWithScoreSystem();
    }

    handleNextQuestion(calculateReadingScore);
  };
  if (!currentResult) return null;

  return (
    <Sheet open={showBottomSheet} onOpenChange={() => {}}>
      <SheetContent
        side="bottom"
        className={cn(
          "min-h-[300px] rounded-t-xl",
          currentResult.isCorrect
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        )}
      >
        <SheetHeader className="text-center space-y-4">
          <SheetTitle
            className={cn(
              "text-2xl font-bold",
              currentResult.isCorrect ? "text-green-800" : "text-red-800"
            )}
          >
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
              <span className="text-muted-foreground">Result:</span>
              <span
                className={cn(
                  "font-semibold",
                  currentResult.isCorrect ? "text-green-600" : "text-red-600"
                )}
              >
                {currentResult.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Meaning:</span>
              <span className="font-semibold text-foreground">
                {currentResult.meaning}
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
