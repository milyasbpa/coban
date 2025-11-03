'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/pwa/core/components/button';
import { useWritingExerciseStore } from '../store/writing-exercise.store';
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
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { 
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { 
  WritingHeader, 
  AnswerFeedback, 
  CompletionScreen,
  AudioPlayer,
  KanjiSelectionGrid
} from '../fragments/writing-fragments';
import { AssemblyArea, SubmitButton, KanjiTile } from '../components';
import { getWritingQuestions, WritingQuestion } from '../utils';

interface WritingExerciseContainerProps {
  level: string;
  lesson: string;
}

export function WritingExerciseContainer({ level, lesson }: WritingExerciseContainerProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<WritingQuestion[]>([]);
  const [shuffledKanji, setShuffledKanji] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Drag and drop state
  const [activeKanji, setActiveKanji] = useState<string | null>(null);
  const [usedKanji, setUsedKanji] = useState<string[]>([]);

  const {
    currentQuestionIndex,
    selectedKanji,
    score,
    isComplete,
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
    insertKanjiAt,
    reorderKanji
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
  }, [level, lesson]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setupCurrentQuestion();
      setUsedKanji([]); // Reset used kanji for new question
    }
  }, [questions, currentQuestionIndex]);

  const loadQuestions = () => {
    try {
      setLoading(true);
      
      // Use utility function to get questions
      const writingQuestions = getWritingQuestions(level, lesson, 5);

      if (writingQuestions.length === 0) {
        console.warn('No kanji found for this lesson');
        return;
      }

      setQuestions(writingQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
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
    const correctChars = currentQuestion.kanji.split('');
    
    // Get some random kanji from other questions as distractors
    const otherKanji = questions
      .filter((_, index) => index !== currentQuestionIndex)
      .flatMap(q => q.kanji.split(''))
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
    setUsedKanji(prev => [...prev, kanji]);
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
    if (activeData?.variant === 'available' && overId === 'assembly-area') {
      const kanjiToAdd = activeData.kanji;
      addKanji(kanjiToAdd);
      
      // Mark kanji as used so it disappears from selection grid
      setUsedKanji(prev => [...prev, kanjiToAdd]);
      return;
    }

    // If reordering within assembly area
    if (activeData?.variant === 'selected' && overId.startsWith('assembly-')) {
      const activeIndex = activeData.sourceIndex;
      const overIndex = parseInt(overId.split('-')[1]);
      
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
    setUsedKanji(prev => prev.filter(k => k !== kanjiToRemove));
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
    setupCurrentQuestion();
  };

  const handleBackToLesson = () => {
    router.push(`/kanji/lesson?level=${level}&lesson=${lesson}`);
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
          <p className="text-muted-foreground">Tidak ada soal untuk lesson ini</p>
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