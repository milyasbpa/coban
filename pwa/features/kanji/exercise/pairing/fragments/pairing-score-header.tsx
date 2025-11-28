"use client";

import { Card } from "@/pwa/core/components/card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { getScoreTextColor } from "../utils/score-colors";

export function PairingScoreHeader() {
  const { gameState, getSectionTotalWords } = usePairingGameStore();
  const totalWords = getSectionTotalWords();
  const scoreTextColor = getScoreTextColor(gameState.score);

  return (
    <div className="flex justify-between items-center mb-6">
      {/* Score Card */}
      <Card className="p-4 bg-card">
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
      <Card className="p-4 bg-card">
        <div className="text-center">
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            Progress
          </div>
          <div className="text-lg font-bold text-foreground">
            {gameState.correctPairs}/{totalWords}
          </div>
        </div>
      </Card>
    </div>
  );
}
