"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/pwa/core/components/button";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import type { QuestionResult } from "@/pwa/features/score/model/score";
import { useWritingExerciseStore } from "../store/writing-exercise.store";
import { ScoreCalculator } from "@/pwa/features/score/utils/score-calculator";
import { WordIdGenerator } from "@/pwa/features/score/utils/word-id-generator";
import { KanjiWordMapper } from "@/pwa/features/score/utils/kanji-word-mapper";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { WritingHeader } from "../fragments/writing-header";
import { AnswerFeedback } from "../fragments/answer-feedback";
import { CompletionScreen } from "../fragments/completion-screen";
import { AudioPlayer } from "../fragments/audio-player";
import { KanjiSelectionGrid } from "../fragments/kanji-selection-grid";
import { AssemblyArea, SubmitButton, KanjiTile } from "../components";
import { getWritingQuestions, WritingQuestion } from "../utils";
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
    currentQuestionIndex,
    selectedKanji,
    showAnswer,
    questions,
    showFeedback,
    scoreIntegrated,
    score,
    activeKanji,
    
    // Actions for container logic
    checkAnswer,
    clearSelected,
    removeKanji,
    removeUsedKanji,
    clearUsedKanji,
    addKanji,
    addUsedKanji,
    setQuestions,
    setShowFeedback,
    setIsCorrect,
    setScoreIntegrated,
    setActiveKanji,
    reorderKanji,
    resetExercise,
    setupCurrentQuestion: setupCurrentQuestionStore,
  } = useWritingExerciseStore();

  // Configure @dnd-kit sensors with better mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
        delay: 100, // Small delay for better mobile experience
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadQuestions();
    resetExercise();
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
              question.kanji,
              level
            );

            // Generate word ID for this word
            const wordId = WordIdGenerator.generateWordId(
              question.kanji,
              kanjiInfo.kanjiId,
              index
            );

            return {
              kanjiId: kanjiInfo.kanjiId,
              kanji: kanjiInfo.kanjiCharacter,
              isCorrect,
              wordId,
              word: question.kanji,
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

  const handleRemoveKanji = (index: number) => {
    const kanjiToRemove = selectedKanji[index];
    removeKanji(index);

    // Make kanji available again in selection grid
    removeUsedKanji(kanjiToRemove);
  };

  const handleClearAll = () => {
    clearSelected();
    clearUsedKanji(); // Make all kanji available again
  };

  const handleBack = () => {
    router.back();
  };



  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Tidak ada soal untuk lesson ini
          </p>
          <Button onClick={handleBack} variant="outline">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (currentQuestionIndex >= questions.length) {
    return <CompletionScreen />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const canSubmit = selectedKanji.length > 0 && !showAnswer;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto p-4 space-y-6">
          <WritingHeader />

          <div className="space-y-6">
            {/* Audio and Reading Display */}
            <AudioPlayer />

            {/* Assembly Area */}
            <AssemblyArea
              selectedKanji={selectedKanji}
              onRemoveKanji={handleRemoveKanji}
              onClear={handleClearAll}
              correctAnswer={currentQuestion.kanji}
              showAnswer={showAnswer}
            />

            {/* Available Kanji */}
            <KanjiSelectionGrid />

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
        {showFeedback && (
          <AnswerFeedback />
        )}
      </div>

      {/* Drag Overlay for visual feedback */}
      <DragOverlay>
        {activeKanji ? (
          <KanjiTile
            id="drag-overlay"
            kanji={activeKanji}
            onClick={() => {}}
            variant="available"
            draggable={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
