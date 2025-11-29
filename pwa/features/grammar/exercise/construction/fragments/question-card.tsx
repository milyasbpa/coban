"use client";

import { Card, CardContent } from "@/pwa/core/components/card";
import { ConstructionQuestion } from "../types/construction.types";

interface QuestionCardProps {
  question: ConstructionQuestion;
  isChecked: boolean;
  isCorrect: boolean | null;
}

export function QuestionCard({
  question,
  isChecked,
  isCorrect,
}: QuestionCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Arrange the words to form the correct sentence
          </p>
          <p className="text-xs text-muted-foreground">
            正しい文を作るために言葉を並べてください
          </p>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg space-y-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Furigana:</p>
            <p className="text-sm text-foreground">{question.example.furigana}</p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Romanji:</p>
            <p className="text-xs text-primary/80">{question.example.romanji}</p>
          </div>
        </div>

        {isChecked && (
          <div className="pt-3 border-t border-border space-y-1">
            <p className="text-sm text-foreground text-center">
              {question.example.meanings.en}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {question.example.meanings.id}
            </p>
          </div>
        )}

        {isChecked && !isCorrect && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-1">
              Correct Answer:
            </p>
            <p className="text-base font-medium text-green-600 dark:text-green-400 text-center">
              {question.correctOrder.join(" ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
