"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { getScoreColor } from "../utils/score-colors";

export function GameResult() {
  const router = useRouter();
  const { gameStats, resetGame } = usePairingGameStore();
  const { score, correctPairs, totalWords, wrongAttempts } = gameStats;
  
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  
  const accuracy = Math.round((correctPairs / (correctPairs + wrongAttempts)) * 100);
  const scoreColors = getScoreColor(score);
  
  // Perfect score (100%) triggers confetti
  const isPerfectScore = accuracy === 100 && wrongAttempts === 0;

  useEffect(() => {
    // Set window dimensions for confetti
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Show confetti for perfect scores
    if (isPerfectScore) {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [isPerfectScore]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Confetti for perfect scores */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          numberOfPieces={200}
          recycle={false}
          gravity={0.1}
        />
      )}
      
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {isPerfectScore ? "Perfect! 🎉" : "Bravo! 🎉"}
          </h1>
          <p className="text-muted-foreground">
            {isPerfectScore 
              ? "Amazing! You got everything right!" 
              : "Congratulations on completing the exercise!"
            }
          </p>
        </div>

        {/* Score Display */}
        <div className={`${scoreColors.bg} border-2 ${scoreColors.border} rounded-xl p-6`}>
          <div className={`text-4xl font-bold ${scoreColors.text} mb-2`}>{score}</div>
          <div className={`text-sm ${scoreColors.textSecondary}`}>Final Score</div>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Correct Pairs:</span>
            <span className="font-semibold text-foreground">{correctPairs}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Words:</span>
            <span className="font-semibold text-foreground">{totalWords}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Wrong Attempts:</span>
            <span className="font-semibold text-foreground">{wrongAttempts}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Accuracy:</span>
            <span className={`font-semibold ${scoreColors.text}`}>{accuracy}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={() => {
              resetGame(gameStats.totalWords, gameStats.totalSections);
              // Emit restart event for container to handle
              window.dispatchEvent(new CustomEvent('gameRestart'));
            }}
            className="w-full"
          >
            Play Again
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}