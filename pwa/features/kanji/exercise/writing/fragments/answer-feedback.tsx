import { Button } from '@/pwa/core/components/button';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/pwa/core/lib/utils';
import { useWritingExerciseStore } from '../store/writing-exercise.store';
import { calculateWritingScore } from '../utils/writing-game';
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { useExerciseSearchParams } from "../../utils/hooks";
import { KanjiContextSection } from "@/pwa/core/components/kanji-context-section";
import { useState } from 'react';

export function AnswerFeedback() {
  const { gameState, questionState, handleNextQuestion, getCurrentQuestion } = useWritingExerciseStore();
  const [showContext, setShowContext] = useState(true);
  
  const { user } = useLoginStore();
  const {
    updateKanjiMastery,
    initializeUser,
    currentUserScore,
    isInitialized,
  } = useKanjiScoreStore();

  const { level } = useExerciseSearchParams();
  
  const isCorrect = questionState.isCorrect;
  const currentQuestionIndex = questionState.currentQuestionIndex;
  const questions = gameState.questions;
  const wrongQuestions = gameState.wrongQuestions;
  const isRetryMode = gameState.isRetryMode;
  const currentQuestion = getCurrentQuestion();
  
  // Use appropriate question set based on mode
  const questionsToUse = isRetryMode ? wrongQuestions : questions;
  const isLastQuestion = currentQuestionIndex >= questionsToUse.length - 1;
  
  const handleNext = () => {
    handleNextQuestion(
      calculateWritingScore,
      level,
      updateKanjiMastery,
      initializeUser,
      isInitialized,
      currentUserScore,
      user?.uid || null
    );
  };
  
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 border-t transition-all duration-300 bg-popover'
    )}>
      {/* Scrollable Content Area */}
      <div className="max-w-sm mx-auto space-y-3 max-h-[80vh] overflow-y-auto p-4 pb-20">
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
                : 'Try to pay attention to the correct kanji order.'
              }
            </p>
          </div>
        </div>

        {/* Context Expansion Section - NEW! */}
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
            onClick={handleNext} 
            className="w-full"
            variant={isCorrect ? "default" : "secondary"}
          >
            {isLastQuestion ? 'Finish' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}