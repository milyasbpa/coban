'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/pwa/core/components/button';
import { useWritingExerciseStore } from '../store/writing-exercise.store';
import { 
  WritingHeader, 
  AnswerFeedback, 
  CompletionScreen,
  AudioPlayer,
  KanjiSelectionGrid
} from '../fragments/writing-fragments';
import { AssemblyArea, SubmitButton } from '../components';
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
    setShowAnswer
  } = useWritingExerciseStore();

  useEffect(() => {
    loadQuestions();
    resetExercise();
  }, [level, lesson]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setupCurrentQuestion();
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
    if (showAnswer) return;
    addKanji(kanji);
  };

  const handleSubmitAnswer = () => {
    if (selectedKanji.length === 0) return;
    
    const result = checkAnswer();
    setIsCorrect(result);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      // Exercise complete
      return;
    }
    
    nextQuestion();
    setShowFeedback(false);
  };

  const handleRestart = () => {
    resetExercise();
    setShowFeedback(false);
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
            onRemoveKanji={removeKanji}
            onClear={clearSelected}
            correctAnswer={currentQuestion.kanji}
            showAnswer={showAnswer}
          />

          {/* Available Kanji */}
          <KanjiSelectionGrid
            availableKanji={shuffledKanji}
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
  );
}