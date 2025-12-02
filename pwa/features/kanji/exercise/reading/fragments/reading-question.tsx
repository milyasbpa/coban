import { playAudio } from "@/pwa/core/lib/utils/audio";
import { KanjiDisplay } from "../components";
import { useReadingDisplayOptions, useReadingExerciseStore } from "../store";
import { ExerciseTimer } from "@/pwa/core/components/exercise-timer";

interface ReadingQuestionProps {
  timerDuration?: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export default function ReadingQuestion({ 
  timerDuration = 0, 
  onTimeUp, 
  isPaused = false 
}: ReadingQuestionProps) {
  const { getCurrentQuestion, questionState } = useReadingExerciseStore();
  const currentQuestion = getCurrentQuestion();
  const { displayRomanji } = useReadingDisplayOptions();

  if (!currentQuestion) return null;

  return (
    <div className="text-center mb-8">
      {/* Timer above title */}
      {timerDuration > 0 && onTimeUp && (
        <div className="flex justify-center mb-4">
          <ExerciseTimer
            duration={timerDuration}
            onTimeUp={onTimeUp}
            isPaused={isPaused}
            key={questionState.currentQuestionIndex}
          />
        </div>
      )}

      <h1 className="text-lg font-semibold text-foreground mb-4">
        Choose the correct reading
      </h1>

      {/* Kanji Display */}
      <KanjiDisplay
        kanji={currentQuestion.word}
        romanji={currentQuestion.romanji}
        showRomanji={displayRomanji}
        onClick={() => {
          playAudio(currentQuestion.furigana);
        }}
      />
    </div>
  );
}
