"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import type { QuestionResult } from "@/pwa/features/score/model/score";
import { useWritingExerciseStore } from "../store/writing-exercise.store";
import { WordIdGenerator } from "@/pwa/features/score/utils/word-id-generator";
import { KanjiWordMapper } from "@/pwa/features/score/utils/kanji-word-mapper";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { WritingHeader } from "../fragments/writing-header";
import { AnswerFeedback } from "../fragments/answer-feedback";
import { WritingGameResult } from "../fragments/writing-game-result";
import { Question } from "../fragments/question";
import { AssemblyArea } from "../fragments/assembly-area";
import { SubmitButton } from "../components";
import { getWritingQuestions } from "../utils";
import { useExerciseSearchParams } from "../../utils/hooks";

export function WritingExerciseContainer() {
  const router = useRouter();
  const { lessonId, topicId, level, selectedKanjiIds } =
    useExerciseSearchParams();

  // All state now managed by useWritingExerciseStore

  // Score management store
  const {
    updateExerciseScore,
    updateKanjiMastery,
    initializeUser,
    currentUserScore,
    isInitialized,
  } = useScoreStore();

  const {
    // State for container logic
    gameState,
    questionState,
    getCurrentQuestion,
    getProgress,

    // Actions for container logic
    checkAnswer,
    addKanji,
    addUsedKanji,
    setQuestions,
    setShowFeedback,
    setIsCorrect,
    setScoreIntegrated,
    setActiveKanji,
    reorderKanji,
    resetExerciseProgress,
    setupCurrentQuestion: setupCurrentQuestionStore,
  } = useWritingExerciseStore();

  // Computed values from state
  const currentQuestionIndex = questionState.currentQuestionIndex;
  const selectedKanji = questionState.selectedKanji;
  const showAnswer = questionState.showAnswer;
  const questions = gameState.questions;
  const showFeedback = questionState.showFeedback;
  const scoreIntegrated = questionState.scoreIntegrated;
  const score = gameState.score;

  // Configure @dnd-kit sensors with easier drag activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced distance for easier drag
        delay: 0, // No delay for immediate response
        tolerance: 8, // Increased tolerance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    resetExerciseProgress();
    loadQuestions();
  }, [lessonId, topicId, level, selectedKanjiIds]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setupCurrentQuestionStore(questions, currentQuestionIndex);
    }
  }, [questions, currentQuestionIndex, setupCurrentQuestionStore]);

  // Score management integration when exercise is complete
  useEffect(() => {
    const integrateScoreManagement = async () => {
      if (
        currentQuestionIndex >= questions.length &&
        questions.length > 0 &&
        !scoreIntegrated
      ) {
        setScoreIntegrated(true);

        // Auto-initialize user if not already initialized
        if (!isInitialized || !currentUserScore) {
          await initializeUser(
            "default-user",
            level as "N5" | "N4" | "N3" | "N2" | "N1"
          );
        }

        // Use imported utilities for word-based scoring

        // Create word-based question results using accurate kanji mapping
        const wordResults: QuestionResult[] = questions.map(
          (question, index) => {
            const isCorrect = index < score; // Simple estimation based on score

            // Get accurate kanji information using mapper
            const kanjiInfo = KanjiWordMapper.getKanjiInfo(
              question.word,
              level
            );

            // Generate word ID for this word
            const wordId = WordIdGenerator.generateWordId(
              question.word,
              kanjiInfo.kanjiId,
              index
            );

            return {
              kanjiId: kanjiInfo.kanjiId,
              kanji: kanjiInfo.kanjiCharacter,
              isCorrect,
              wordId,
              word: question.word,
              exerciseType: "writing" as const,
            };
          }
        );

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
          const totalWordsInKanji = firstWord
            ? KanjiWordMapper.getTotalWordsForKanji(firstWord, level)
            : 1;

          // Update each word's mastery
          results.forEach((result) => {
            updateKanjiMastery(kanjiId, result.kanji, [result]);
          });
        });
      }
    };

    integrateScoreManagement();
  }, [
    currentQuestionIndex,
    questions.length,
    score,
    scoreIntegrated,
    isInitialized,
    currentUserScore,
    initializeUser,
    updateExerciseScore,
    updateKanjiMastery,
    level,
    lessonId,
    topicId,
    questions,
  ]);

  const loadQuestions = () => {
    if (!lessonId && !topicId) {
      console.warn("No lessonId or topicId provided");
      return;
    }

    // Use utility function to get questions - now based on examples (words)
    const writingQuestions = getWritingQuestions(
      level,
      lessonId ? parseInt(lessonId) : null,
      selectedKanjiIds,
      topicId || undefined
    );

    if (writingQuestions.length === 0) {
      console.warn("No examples found for this lesson/topic");
      return;
    }

    setQuestions(writingQuestions);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current;
    if (activeData?.kanji) {
      setActiveKanji(activeData.kanji);
    }
  };

  // Handle drag over (for drop zones)
  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add any over logic here
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveKanji(null); // Clear active kanji

    if (!over || showAnswer) return;

    const activeData = active.data.current;
    const overId = over.id as string;

    // If dragging from selection grid to assembly area
    if (activeData?.variant === "available" && overId === "assembly-area") {
      const kanjiToAdd = activeData.kanji;
      addKanji(kanjiToAdd);

      // Mark kanji as used so it disappears from selection grid
      addUsedKanji(kanjiToAdd);
      return;
    }

    // If reordering within assembly area
    if (activeData?.variant === "selected" && overId.startsWith("assembly-")) {
      const activeIndex = activeData.sourceIndex;
      const overIndex = parseInt(overId.split("-")[1]);

      if (activeIndex !== overIndex) {
        reorderKanji(activeIndex, overIndex);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedKanji.length === 0) return;

    const result = checkAnswer();
    setIsCorrect(result);
    setShowFeedback(true);
  };

  // Show completion screen
  if (currentQuestionIndex >= questions.length) {
    return <WritingGameResult />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const canSubmit = selectedKanji.length > 0 && !showAnswer;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto p-4 space-y-6">
          <WritingHeader />

          <div className="space-y-6">
            {/* Audio and Reading Display */}
            <Question />

            {/* Assembly Area with Kanji Selection Grid */}
            <AssemblyArea />

            {/* Submit Button */}
            {!showAnswer && (
              <SubmitButton
                onSubmit={handleSubmitAnswer}
                canSubmit={canSubmit}
              />
            )}
          </div>
        </div>

        {/* Answer Feedback */}
        {showFeedback && <AnswerFeedback />}
      </div>
    </DndContext>
  );
}
