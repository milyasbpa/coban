"use client";

import { Button } from "@/pwa/core/components/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface OptionsGridProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  isChecked: boolean;
  onSelectAnswer: (answer: string) => void;
}

export function OptionsGrid({
  options,
  selectedAnswer,
  correctAnswer,
  isChecked,
  onSelectAnswer,
}: OptionsGridProps) {
  const getButtonStyle = (option: string) => {
    if (!isChecked) {
      return option === selectedAnswer
        ? "border-2 border-primary bg-primary/10 text-primary"
        : "border border-border bg-card hover:bg-muted";
    }

    // After checking
    if (option === correctAnswer) {
      return "border-2 border-green-500 bg-green-500/10 text-green-600 dark:text-green-400";
    }

    if (option === selectedAnswer && !isChecked) {
      return "border-2 border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
    }

    return "border border-border bg-muted/50 text-muted-foreground";
  };

  const showIcon = (option: string) => {
    if (!isChecked) return null;

    if (option === correctAnswer) {
      return <CheckCircle2 className="w-5 h-5" />;
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return <XCircle className="w-5 h-5" />;
    }

    return null;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className={`h-auto py-4 px-4 text-lg font-medium transition-all ${getButtonStyle(
            option
          )}`}
          onClick={() => onSelectAnswer(option)}
          disabled={isChecked}
        >
          <span className="flex items-center justify-center gap-2">
            {option}
            {showIcon(option)}
          </span>
        </Button>
      ))}
    </div>
  );
}
