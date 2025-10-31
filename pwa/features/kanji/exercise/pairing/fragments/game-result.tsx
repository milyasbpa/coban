"use client";

import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { GameStats } from "../utils/pairing-game";

interface GameResultProps {
  stats: GameStats;
  onRestart: () => void;
  onBackToHome: () => void;
}

export function GameResult({ stats, onRestart, onBackToHome }: GameResultProps) {
  const accuracy = Math.round((stats.correctPairs / (stats.correctPairs + stats.wrongAttempts)) * 100);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Bravo! 🎉</h1>
          <p className="text-muted-foreground">Congratulations on completing the exercise!</p>
        </div>

        {/* Score Display */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="text-4xl font-bold text-green-600 mb-2">{stats.score}</div>
          <div className="text-sm text-green-800">Final Score</div>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Correct Pairs:</span>
            <span className="font-semibold text-foreground">{stats.correctPairs}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Words:</span>
            <span className="font-semibold text-foreground">{stats.totalWords}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Wrong Attempts:</span>
            <span className="font-semibold text-foreground">{stats.wrongAttempts}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Accuracy:</span>
            <span className="font-semibold text-foreground">{accuracy}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={onRestart}
            className="w-full"
          >
            Play Again
          </Button>
          <Button 
            variant="outline"
            onClick={onBackToHome}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}