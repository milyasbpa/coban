import { Button } from '../../../../../core/components/button';
import { cn } from '../../../../../core/lib/utils';
import { useWritingExerciseStore } from '../store/writing-exercise.store';
import { useRouter } from 'next/navigation';

export function CompletionScreen() {
  const router = useRouter();
  const { 
    gameState, 
    resetExercise, 
    setScoreIntegrated, 
    setupCurrentQuestion,
    canRetry,
    startRetryMode,
    getWrongQuestions,
    getTotalQuestions
  } = useWritingExerciseStore();
  const score = gameState.score;
  const questions = gameState.questions;
  const isRetryMode = gameState.isRetryMode;
  
  const totalQuestions = getTotalQuestions();
  
  const handleRestart = () => {
    resetExercise();
    setScoreIntegrated(false);
    if (questions.length > 0) {
      setupCurrentQuestion(questions, 0);
    }
  };

  const handleRetry = () => {
    startRetryMode();
  };
  
  const handleBackToLesson = () => {
    // Get current URL params to determine how to navigate back
    const searchParams = new URLSearchParams(window.location.search);
    const topicId = searchParams.get('topicId');
    const lessonId = searchParams.get('lessonId');
    const level = searchParams.get('level');
    
    if (topicId) {
      router.push(`/kanji/lesson?topicId=${topicId}&level=${level}`);
    } else if (lessonId) {
      router.push(`/kanji/lesson?lessonId=${lessonId}&level=${level}`);
    } else {
      router.back();
    }
  };
  
  const percentage = Math.round((score / totalQuestions) * 100);
  const isExcellent = percentage >= 80;
  const isGood = percentage >= 60;
  const showRetryButton = canRetry() && !isRetryMode;
  
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
          {/* Retry Button - only show if there are wrong questions and not in retry mode */}
          {showRetryButton && (
            <Button
              onClick={handleRetry}
              variant="default"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              🔄 Ulangi Soal yang Salah ({getWrongQuestions().length})
            </Button>
          )}
          
          <Button 
            onClick={handleRestart} 
            variant={showRetryButton ? "outline" : "default"} 
            className="w-full"
          >
            Ulangi Latihan
          </Button>
          <Button onClick={handleBackToLesson} variant="outline" className="w-full">
            Kembali ke Lesson
          </Button>
        </div>
      </div>
    </div>
  );
}