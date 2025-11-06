import { Progress } from '@/pwa/core/components/progress';
import { Button } from '@/pwa/core/components/button';
import { ArrowLeft } from 'lucide-react';
import { useWritingExerciseStore } from '../store/writing-exercise.store';
import { useRouter } from 'next/navigation';

export function WritingHeader() {
  const router = useRouter();
  const { gameState, questionState } = useWritingExerciseStore();
  const currentQuestionIndex = questionState.currentQuestionIndex;
  const questions = gameState.questions;
  const score = gameState.score;
  
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Soal {currentQuestionIndex + 1} dari {totalQuestions}
            </span>
            <span className="text-sm text-muted-foreground">
              Skor: {score}/{totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
}