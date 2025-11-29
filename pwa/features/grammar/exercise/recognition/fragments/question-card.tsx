"use client";

import { Card, CardContent } from "@/pwa/core/components/card";
import { RecognitionQuestion } from "../types/recognition.types";

interface QuestionCardProps {
  question: RecognitionQuestion;
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
            Which grammar pattern is used in this sentence?
          </p>
          <p className="text-xs text-muted-foreground">
            この文にはどの文法パターンが使われていますか？
          </p>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-xl font-medium text-foreground text-center mb-2">
            {question.example.japanese}
          </p>
          <p className="text-sm text-muted-foreground text-center">
            {question.example.furigana}
          </p>
          <p className="text-xs text-primary/80 text-center mt-2">
            {question.example.romanji}
          </p>
        </div>

        {isChecked && (
          <div className="pt-3 border-t border-border space-y-1">
            <p className="text-sm font-medium text-foreground text-center">Translation:</p>
            <p className="text-sm text-foreground text-center">
              {question.example.meanings.en}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {question.example.meanings.id}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
