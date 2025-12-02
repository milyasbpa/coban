"use client";

import { Card } from "@/pwa/core/components/card";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { ExerciseTimer } from "@/pwa/core/components/exercise-timer";

function getScoreTextColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 50) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

interface VocabularyPairingScoreHeaderProps {
  timerDuration?: number;
  onTimeUp?: () => void;
  sectionIndex?: number;
}

export function VocabularyPairingScoreHeader({
  timerDuration = 0,
  onTimeUp,
  sectionIndex = 0,
}: VocabularyPairingScoreHeaderProps) {
  const {
    gameState: { score, correctPairs },
    getTotalGameWords, // Get total words across all sections
  } = useVocabularyPairingExerciseStore();

  const totalWords = getTotalGameWords(); // Total words keseluruhan, bukan per section
  const scoreTextColor = getScoreTextColor(score);

  return (
    <div className="flex justify-between items-center mb-6 gap-3">
      {/* Score Card */}
      <Card className="p-4 bg-card flex-1">
        <div className="text-center">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Score</div>
          <div className={`text-lg font-bold ${scoreTextColor}`}>{score}</div>
        </div>
      </Card>

      {/* Progress Card */}
      <Card className="p-4 bg-card flex-1">
        <div className="text-center">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Progress</div>
          <div className="text-lg font-bold text-foreground">
            {correctPairs}/{totalWords}
          </div>
        </div>
      </Card>

      {/* Timer Card */}
      {timerDuration > 0 && onTimeUp && (
        <Card className="p-4 bg-card flex-1">
          <div className="flex justify-center items-center">
            <ExerciseTimer
              duration={timerDuration}
              onTimeUp={onTimeUp}
              isPaused={false}
              key={sectionIndex}
            />
          </div>
        </Card>
      )}
    </div>
  );
}