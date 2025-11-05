import { Button } from '@/pwa/core/components/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/pwa/core/lib/utils';
import { useWritingExerciseStore } from '../store/writing-exercise.store';

export function AnswerFeedback() {
  const { isCorrect, currentQuestionIndex, questions, nextQuestion } = useWritingExerciseStore();
  
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;
  
  const handleNext = () => {
    if (isLastQuestion) {
      // Exercise complete - handled by container logic
      return;
    }
    nextQuestion();
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
              {isCorrect ? 'Benar!' : 'Salah!'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isCorrect 
                ? 'Jawaban Anda tepat!' 
                : 'Coba perhatikan urutan kanji yang benar.'
              }
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleNext} 
          className="w-full"
          variant={isCorrect ? "default" : "secondary"}
        >
          {isLastQuestion ? 'Selesai' : 'Lanjut'}
        </Button>
      </div>
    </div>
  );
}