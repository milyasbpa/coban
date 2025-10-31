import { Progress } from '@/pwa/core/components/progress';
import { Button } from '@/pwa/core/components/button';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/pwa/core/lib/utils';

// Fragment exports
export { AudioPlayer } from './audio-player';
export { KanjiSelectionGrid } from './kanji-selection-grid';

interface WritingHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  onBack: () => void;
}

export function WritingHeader({ currentQuestion, totalQuestions, score, onBack }: WritingHeaderProps) {
  const progress = ((currentQuestion) / totalQuestions) * 100;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Soal {currentQuestion + 1} dari {totalQuestions}
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

interface AnswerFeedbackProps {
  isCorrect: boolean;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function AnswerFeedback({ isCorrect, onNext, isLastQuestion }: AnswerFeedbackProps) {
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
          onClick={onNext} 
          className="w-full"
          variant={isCorrect ? "default" : "secondary"}
        >
          {isLastQuestion ? 'Selesai' : 'Lanjut'}
        </Button>
      </div>
    </div>
  );
}

interface CompletionScreenProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onBackToLesson: () => void;
}

export function CompletionScreen({ 
  score, 
  totalQuestions, 
  onRestart, 
  onBackToLesson 
}: CompletionScreenProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isExcellent = percentage >= 80;
  const isGood = percentage >= 60;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div>
          <div className={cn(
            'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl',
            isExcellent && 'bg-green-100 text-green-600',
            isGood && !isExcellent && 'bg-yellow-100 text-yellow-600',
            !isGood && 'bg-red-100 text-red-600'
          )}>
            {isExcellent ? '🎉' : isGood ? '👍' : '📝'}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {isExcellent ? 'Excellent!' : isGood ? 'Good Job!' : 'Keep Practicing!'}
          </h1>
          
          <p className="text-muted-foreground mb-4">
            Anda menjawab <span className="font-semibold">{score}</span> dari{' '}
            <span className="font-semibold">{totalQuestions}</span> soal dengan benar
          </p>
          
          <div className="text-3xl font-bold text-primary mb-6">
            {percentage}%
          </div>
        </div>
        
        <div className="space-y-3">
          <Button onClick={onRestart} variant="default" className="w-full">
            Ulangi Latihan
          </Button>
          <Button onClick={onBackToLesson} variant="outline" className="w-full">
            Kembali ke Lesson
          </Button>
        </div>
      </div>
    </div>
  );
}