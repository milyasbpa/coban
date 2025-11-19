import { Button } from '@/pwa/core/components/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/pwa/core/lib/utils';
import { useWritingExerciseStore } from '../store/writing-exercise.store';
import { calculateWritingScore } from '../utils/writing-game';
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useExerciseSearchParams } from "../../utils/hooks";

export function AnswerFeedback() {
  const { gameState, questionState, handleNextQuestion } = useWritingExerciseStore();
  
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
      currentUserScore
    );
  };
  
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 p-4 border-t bg-background/95 backdrop-blur-sm transition-all duration-300',
      isCorrect ? 'border-green-500/20 bg-green-50/50' : 'border-red-500/20 bg-red-50/50'
    )}>
      <div className="max-w-sm mx-auto space-y-3">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
          <div>
            <p className={cn(
              'font-medium',
              isCorrect ? 'text-green-700' : 'text-red-700'
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
        
        <Button 
          onClick={handleNext} 
          className="w-full"
          variant={isCorrect ? "default" : "secondary"}
        >
          {isLastQuestion ? 'Finish' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}