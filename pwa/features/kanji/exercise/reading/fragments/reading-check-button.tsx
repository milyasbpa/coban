"use client";

import { Button } from "@/pwa/core/components/button";
import { useReadingExerciseStore } from "../store";
import { checkAnswer } from "../utils/reading-game";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import { useExerciseSearchParams } from "../../utils/hooks";
import type { QuestionResult } from "@/pwa/features/score/model/score";
import { WordIdGenerator } from "@/pwa/features/score/utils/word-id-generator";
import { KanjiWordMapper } from "@/pwa/features/score/utils/kanji-word-mapper";

export function ReadingCheckButton() {
  const {
    questionState: { inputMode, selectedOption, directInput },
    getCurrentQuestion,
    getCurrentQuestionNumber,
    getCanCheck,
    getIsAnswered,
    setCurrentResult,
    setShowBottomSheet,
    addWrongQuestion,
    addCorrectQuestion,
  } = useReadingExerciseStore();

  const {
    updateKanjiMastery,
    initializeUser,
    currentUserScore,
    isInitialized,
  } = useScoreStore();

  const { level } = useExerciseSearchParams();

  // Real-time per-question score integration
  const integrateQuestionScore = async (question: any, isCorrect: boolean) => {
    try {

      // Auto-initialize user if not already initialized
      if (!isInitialized || !currentUserScore) {
        await initializeUser(
          "default-user",
          level as "N5" | "N4" | "N3" | "N2" | "N1"
        );
      }

      // Use imported utilities for word-based scoring

      // Extract kanji character from the question
      const kanjiCharacter = question.kanji.charAt(0);

      // Get accurate kanji information using the extracted kanji character
      const kanjiInfo = KanjiWordMapper.getKanjiInfo(kanjiCharacter, level);

      // Generate unique word ID based on actual question content
      const wordId = WordIdGenerator.generateWordId(
        question.kanji,
        kanjiInfo.kanjiId,
        getCurrentQuestionNumber() - 1
      );

      const questionResult: QuestionResult = {
        kanjiId: kanjiInfo.kanjiId,
        kanji: kanjiCharacter,
        isCorrect,
        wordId,
        word: question.kanji,
        exerciseType: "reading" as const,
      };

      // Update word mastery immediately (first attempt only)
      updateKanjiMastery(kanjiInfo.kanjiId, kanjiCharacter, [questionResult]);
    } catch (error) {
      console.error("Error in first-attempt question score integration:", error);
    }
  };

  const currentQuestion = getCurrentQuestion();
  const canCheck = getCanCheck();
  const isAnswered = getIsAnswered();

  const handleCheckAnswer = async () => {
    if (!currentQuestion) return;

    const userAnswer =
      inputMode === "multiple-choice" ? selectedOption : directInput;

    if (!userAnswer.trim()) return; // No answer provided

    const result = checkAnswer(currentQuestion, userAnswer);
    setCurrentResult(result);
    setShowBottomSheet(true);

    // Track wrong questions for retry
    if (!result.isCorrect) {
      addWrongQuestion(currentQuestion);
    }

    // Update stats - add to correctQuestions array if correct
    if (result.isCorrect) {
      addCorrectQuestion(currentQuestion);
    }

    // REAL-TIME Per-Question Score Integration
    await integrateQuestionScore(currentQuestion, result.isCorrect);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[red] backdrop-blur supports-backdrop-filter:bg-background/60 border-t border-border p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={handleCheckAnswer}
          disabled={!canCheck || isAnswered}
          className="w-full h-10 text-sm bg-primary disabled:bg-muted text-white disabled:text-foreground"
        >
          Check
        </Button>
      </div>
    </div>
  );
}
