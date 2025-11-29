"use client";

import { Button } from "@/pwa/core/components/button";
import { X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/pwa/core/components/card";

interface AnswerAreaProps {
  userAnswer: string[];
  correctOrder: string[];
  isChecked: boolean;
  isCorrect: boolean | null;
  onRemoveWord: (index: number) => void;
  onClear: () => void;
}

export function AnswerArea({
  userAnswer,
  correctOrder,
  isChecked,
  isCorrect,
  onRemoveWord,
  onClear,
}: AnswerAreaProps) {
  const getBorderColor = () => {
    if (!isChecked) return "border-border";
    return isCorrect ? "border-green-500" : "border-red-500";
  };

  const getBgColor = () => {
    if (!isChecked) return "bg-card";
    return isCorrect ? "bg-green-500/5" : "bg-red-500/5";
  };

  return (
    <Card className={`border-2 ${getBorderColor()} ${getBgColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Your Answer:</p>
          {userAnswer.length > 0 && !isChecked && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="min-h-[80px] p-3 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
          {userAnswer.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                Tap words below to construct the sentence
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userAnswer.map((word, index) => (
                <div
                  key={index}
                  className={`group relative px-3 py-2 rounded-md font-medium transition-all ${
                    isChecked
                      ? isCorrect
                        ? "bg-green-500/20 text-green-700 dark:text-green-300"
                        : "bg-red-500/20 text-red-700 dark:text-red-300"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <span className="text-base">{word}</span>
                  {!isChecked && (
                    <button
                      onClick={() => onRemoveWord(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {isChecked && userAnswer.length > 0 && (
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-foreground">
              {userAnswer.join(" ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
