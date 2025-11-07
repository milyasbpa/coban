"use client";

import { Card } from "@/pwa/core/components/card";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";

function getScoreTextColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
}

export function VocabularyPairingScoreHeader() {
  const {
    gameState: { score },
    sectionState: { matchedPairs, gameWords },
  } = useVocabularyPairingExerciseStore();

  const totalWords = gameWords.length;
  const scoreTextColor = getScoreTextColor(score);

  return (
    <div className="flex justify-between items-center mb-6">
      {/* Score Card */}
      <Card className="p-4 bg-card">
        <div className="text-center">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Score</div>
          <div className={`text-lg font-bold ${scoreTextColor}`}>{score}</div>
        </div>
      </Card>

      {/* Progress Card */}
      <Card className="p-4 bg-card">
        <div className="text-center">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Progress</div>
          <div className="text-lg font-bold text-foreground">
            {matchedPairs.size}/{totalWords}
          </div>
        </div>
      </Card>
    </div>
  );
}