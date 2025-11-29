"use client";

import { Card, CardContent } from "@/pwa/core/components/card";
import { FillingQuestion } from "../types/filling.types";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: FillingQuestion;
  selectedAnswer: string | null;
  isChecked: boolean;
  isCorrect: boolean | null;
}

export function QuestionCard({
  question,
  selectedAnswer,
  isChecked,
  isCorrect,
}: QuestionCardProps) {
  const renderSentenceWithBlank = () => {
    return question.sentenceParts.map((part, index) => {
      if (index === question.blankIndex) {
        return (
          <span key={index} className="inline-flex items-center">
            <span
              className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1 mx-1 rounded-md border-2 font-medium transition-colors ${
                !isChecked
                  ? "border-dashed border-primary/40 bg-primary/5 text-primary"
                  : isCorrect
                  ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                  : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {selectedAnswer || "___"}
              {isChecked && (
                <span className="ml-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </span>
              )}
            </span>
          </span>
        );
      }
      return (
        <span key={index} className="text-foreground">
          {part}{" "}
        </span>
      );
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-4">
        {/* Instruction */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Fill in the blank with the correct word
          </p>
          <p className="text-xs text-muted-foreground">
            空欄に正しい言葉を入れてください
          </p>
        </div>

        {/* Sentence with blank */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-xl leading-relaxed text-center font-medium">
            {renderSentenceWithBlank()}
          </p>
        </div>

        {/* Furigana */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{question.example.furigana}</p>
        </div>

        {/* Romanji */}
        <div className="text-center">
          <p className="text-xs text-primary/80">{question.example.romanji}</p>
        </div>

        {/* Translation (shown after check) */}
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

        {/* Correct answer (shown when wrong) */}
        {isChecked && !isCorrect && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-1">
              Correct Answer:
            </p>
            <p className="text-base font-medium text-green-600 dark:text-green-400 text-center">
              {question.correctAnswer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
