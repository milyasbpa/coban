"use client";

import { Button } from "@/pwa/core/components/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { RecognitionOption } from "../types/recognition.types";

interface OptionsGridProps {
  options: RecognitionOption[];
  selectedAnswer: number | null;
  correctPatternId: number;
  isChecked: boolean;
  onSelectAnswer: (patternId: number) => void;
}

export function OptionsGrid({
  options,
  selectedAnswer,
  correctPatternId,
  isChecked,
  onSelectAnswer,
}: OptionsGridProps) {
  const getButtonStyle = (option: RecognitionOption) => {
    if (!isChecked) {
      return option.patternId === selectedAnswer
        ? "border-2 border-primary bg-primary/10 text-foreground"
        : "border border-border bg-card hover:bg-muted text-foreground";
    }

    if (option.patternId === correctPatternId) {
      return "border-2 border-green-500 bg-green-500/10 text-foreground";
    }

    if (option.patternId === selectedAnswer) {
      return "border-2 border-red-500 bg-red-500/10 text-foreground";
    }

    return "border border-border bg-muted/50 text-muted-foreground";
  };

  const showIcon = (option: RecognitionOption) => {
    if (!isChecked) return null;

    if (option.patternId === correctPatternId) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }

    if (option.patternId === selectedAnswer) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }

    return null;
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Select the correct pattern:</p>
      {options.map((option) => (
        <Button
          key={option.patternId}
          variant="outline"
          className={`w-full h-auto py-4 px-4 justify-start text-left transition-all ${getButtonStyle(
            option
          )}`}
          onClick={() => onSelectAnswer(option.patternId)}
          disabled={isChecked}
        >
          <div className="flex items-start gap-3 w-full">
            <div className="flex-1">
              <p className="text-lg font-medium mb-1">{option.japanese}</p>
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            </div>
            {showIcon(option)}
          </div>
        </Button>
      ))}
    </div>
  );
}
