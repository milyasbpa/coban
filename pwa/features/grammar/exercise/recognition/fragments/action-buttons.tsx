"use client";

import { Button } from "@/pwa/core/components/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface ActionButtonsProps {
  selectedAnswer: number | null;
  isChecked: boolean;
  isCorrect: boolean | null;
  isLastQuestion: boolean;
  onCheck: () => void;
  onNext: () => void;
}

export function ActionButtons({
  selectedAnswer,
  isChecked,
  isCorrect,
  isLastQuestion,
  onCheck,
  onNext,
}: ActionButtonsProps) {
  if (!isChecked) {
    return (
      <Button
        className="w-full py-6 text-base font-medium"
        onClick={onCheck}
        disabled={selectedAnswer === null}
      >
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Check Answer
      </Button>
    );
  }

  return (
    <Button
      className={`w-full py-6 text-base font-medium ${
        isCorrect
          ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          : "bg-primary hover:bg-primary/90"
      }`}
      onClick={onNext}
    >
      {isLastQuestion ? "Finish" : "Next Question"}
      <ArrowRight className="w-5 h-5 ml-2" />
    </Button>
  );
}
