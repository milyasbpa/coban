"use client";

import { Card } from "@/pwa/core/components/card";

interface ScoreHeaderProps {
  score: number;
  currentSection: number;
  totalSections: number;
  correctPairs: number;
  totalWords: number;
}

export function ScoreHeader({ 
  score, 
  currentSection, 
  totalSections, 
  correctPairs, 
  totalWords 
}: ScoreHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Score Card */}
      <Card className="p-4 bg-card">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">SCORE</div>
          <div className="text-2xl font-bold text-green-600">{score}</div>
        </div>
      </Card>

      {/* Progress Card */}
      <Card className="p-4 bg-card">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">
            {correctPairs}/{totalWords}
          </div>
        </div>
      </Card>
    </div>
  );
}