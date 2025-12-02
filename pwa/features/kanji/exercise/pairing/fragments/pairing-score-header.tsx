"use client";

import { Card } from "@/pwa/core/components/card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { getScoreTextColor } from "../utils/score-colors";
import { ExerciseTimer } from "@/pwa/core/components/exercise-timer";

interface PairingScoreHeaderProps {
  timerDuration?: number;
  onTimeUp?: () => void;
  sectionIndex?: number;
}

export function PairingScoreHeader({
  timerDuration = 0,
  onTimeUp,
  sectionIndex = 0,
}: PairingScoreHeaderProps) {
  const { gameState, getSectionTotalWords } = usePairingGameStore();
  const totalWords = getSectionTotalWords();
  const scoreTextColor = getScoreTextColor(gameState.score);

  return (
    <div className="flex justify-between items-center mb-6 gap-3">
      {/* Score Card */}
      <Card className="p-4 bg-card flex-1">
        <div className="text-center">
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            Score
          </div>
          <div className={`text-lg font-bold ${scoreTextColor}`}>
            {gameState.score}
          </div>
        </div>
      </Card>

      {/* Progress Card */}
      <Card className="p-4 bg-card flex-1">
        <div className="text-center">
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            Progress
          </div>
          <div className="text-lg font-bold text-foreground">
            {gameState.correctPairs}/{totalWords}
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
