"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/pwa/core/components/button";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import type { QuestionResult } from "@/pwa/features/score/model/score";
import { useWritingExerciseStore } from "../store/writing-exercise.store";
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
import {
  WritingHeader,
  AnswerFeedback,
  CompletionScreen,
  AudioPlayer,
  KanjiSelectionGrid,
} from "../fragments/writing-fragments";
import { AssemblyArea, SubmitButton, KanjiTile } from "../components";
import { getWritingQuestions, WritingQuestion } from "../utils";
import { useExerciseSearchParams } from "../../utils/hooks";

export function WritingExerciseContainer() {
  const router = useRouter();
  const { lessonId, topicId, level, selectedKanjiIds } =
    useExerciseSearchParams();

  const [questions, setQuestions] = useState<WritingQuestion[]>([]);
  const [shuffledKanji, setShuffledKanji] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Drag and drop state
  const [activeKanji, setActiveKanji] = useState<string | null>(null);
  const [usedKanji, setUsedKanji] = useState<string[]>([]);
  const [scoreIntegrated, setScoreIntegrated] = useState(false);

  // Score management store
  const {
    updateExerciseScore,
    updateKanjiMastery,
    initializeUser,
    currentUserScore,
    isInitialized,
  } = useScoreStore();

  const {
    currentQuestionIndex,
    selectedKanji,
    score,
    showAnswer,
    addKanji,
    removeKanji,
    clearSelected,
    checkAnswer,
    nextQuestion,
    resetExercise,
    setCorrectAnswer,
    setAvailableKanji,
    setShowAnswer,
    reorderKanji,
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
      setupCurrentQuestion();
      setUsedKanji([]); // Reset used kanji for new question
    }
  }, [questions, currentQuestionIndex]);

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
          console.log("ScoreStore: Auto-initializing user...");
          await initializeUser(
            "default-user",
            level as "N5" | "N4" | "N3" | "N2" | "N1"
          );
        }

        const createExerciseAttempt = () => {
          const startTime = new Date(
            Date.now() - questions.length * 30000
          ).toISOString(); // Estimate 30 seconds per question
          const endTime = new Date().toISOString();
          const duration = questions.length * 30; // Estimate duration
          const wrongAnswers = questions.length - score;

          // Create detailed answers from writing game data
          const answers: QuestionResult[] = questions.map((question, index) => {
            const isCorrect = index < score; // Simple estimation based on score

            return {
              questionId: `writing-${index}`,
              kanjiId: question.kanji,
              kanji: question.kanji,
              userAnswer: isCorrect ? question.kanji : "wrong-answer",
              correctAnswer: question.kanji,
              isCorrect,
              timeSpent: Math.random() * 60 + 20, // Estimate 20-80 seconds per question
              difficulty: (score / questions.length >= 0.8
                ? "medium"
                : "easy") as "easy" | "medium" | "hard",
            };
          });

          return {
            attemptId: `writing-${lessonId || topicId}-${Date.now()}`,
            lessonId: lessonId || topicId || "unknown",
            exerciseType: "writing" as const,
            level,
            startTime,
            endTime,
            duration,
            totalQuestions: questions.length,
            correctAnswers: score,
            wrongAnswers,
            score: Math.round((score / questions.length) * 100),
            accuracy: Math.round((score / questions.length) * 100),
            answers,
          };
        };

        // Update exercise score in the system
        const exerciseAttempt = createExerciseAttempt();
        await updateExerciseScore(exerciseAttempt);

        // Update individual kanji mastery
        questions.forEach((question, index) => {
          const isCorrect = index < score;

          const questionResult: QuestionResult = {
            questionId: `writing-${index}`,
            kanjiId: question.kanji,
            kanji: question.kanji,
            userAnswer: isCorrect ? question.kanji : "wrong-answer",
            correctAnswer: question.kanji,
            isCorrect,
            timeSpent: Math.random() * 60 + 20,
            difficulty: (score / questions.length >= 0.8
              ? "medium"
              : "easy") as "easy" | "medium" | "hard",
          };

          updateKanjiMastery(question.kanji, question.kanji, [questionResult]);
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
    try {
      setLoading(true);

      if (!lessonId && !topicId) {
        console.warn("No lessonId or topicId provided");
        setLoading(false);
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
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupCurrentQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Set the correct answer
    setCorrectAnswer(currentQuestion.kanji);

    // Create shuffled kanji array for selection
    // Include correct kanji characters plus some distractors
    const correctChars = currentQuestion.kanji.split("");

    // Get some random kanji from other questions as distractors
    const otherKanji = questions
      .filter((_, index) => index !== currentQuestionIndex)
      .flatMap((q) => q.kanji.split(""))
      .filter((char, index, arr) => arr.indexOf(char) === index) // Remove duplicates
      .slice(0, Math.max(5, 8 - correctChars.length)); // Ensure we have enough options

    const allOptions = [...correctChars, ...otherKanji];

    // Shuffle the options
    const shuffled = allOptions.sort(() => Math.random() - 0.5);

    setShuffledKanji(shuffled);
    setAvailableKanji(shuffled);
    setShowAnswer(false);
    setShowFeedback(false);
  };

  const handleKanjiClick = (kanji: string) => {
    if (showAnswer || usedKanji.includes(kanji)) return;
    addKanji(kanji);
    setUsedKanji((prev) => [...prev, kanji]);
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
      setUsedKanji((prev) => [...prev, kanjiToAdd]);
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
    setUsedKanji((prev) => prev.filter((k) => k !== kanjiToRemove));
  };

  const handleClearAll = () => {
    clearSelected();
    setUsedKanji([]); // Make all kanji available again
  };

  const handleNext = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      // Exercise complete
      return;
    }

    nextQuestion();
    setShowFeedback(false);
    setUsedKanji([]); // Reset for next question
  };

  const handleRestart = () => {
    resetExercise();
    setShowFeedback(false);
    setUsedKanji([]);
    setScoreIntegrated(false); // Reset score integration flag
    setupCurrentQuestion();
  };

  const handleBackToLesson = () => {
    if (topicId) {
      router.push(`/kanji/lesson?topicId=${topicId}&level=${level}`);
    } else if (lessonId) {
      router.push(`/kanji/lesson?lessonId=${lessonId}&level=${level}`);
    } else {
      router.back();
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Memuat soal writing...</p>
        </div>
      </div>
    );
  }

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
    return (
      <CompletionScreen
        score={score}
        totalQuestions={questions.length}
        onRestart={handleRestart}
        onBackToLesson={handleBackToLesson}
      />
    );
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
          <WritingHeader
            currentQuestion={currentQuestionIndex}
            totalQuestions={questions.length}
            score={score}
            onBack={handleBack}
          />

          <div className="space-y-6">
            {/* Audio and Reading Display */}
            <AudioPlayer
              audioUrl={currentQuestion.audio}
              reading={currentQuestion.reading}
            />

            {/* Assembly Area */}
            <AssemblyArea
              selectedKanji={selectedKanji}
              onRemoveKanji={handleRemoveKanji}
              onClear={handleClearAll}
              correctAnswer={currentQuestion.kanji}
              showAnswer={showAnswer}
            />

            {/* Available Kanji */}
            <KanjiSelectionGrid
              availableKanji={shuffledKanji}
              usedKanji={usedKanji}
              onKanjiClick={handleKanjiClick}
              disabled={showAnswer}
            />

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
          <AnswerFeedback
            isCorrect={isCorrect}
            onNext={handleNext}
            isLastQuestion={currentQuestionIndex >= questions.length - 1}
          />
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
