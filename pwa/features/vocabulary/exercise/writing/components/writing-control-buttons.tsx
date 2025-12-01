import React from "react";
import { Button } from "@/pwa/core/components/button";

interface WritingControlButtonsProps {
  canCheck: boolean;
  isAnswered: boolean;
  isCorrect?: boolean;
  onCheck: () => void;
  onNext: () => void;
}

export const WritingControlButtons: React.FC<WritingControlButtonsProps> = ({
  canCheck,
  isAnswered,
  isCorrect,
  onCheck,
  onNext,
}) => {
  if (!isAnswered) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50">
        <div className="container mx-auto max-w-2xl">
          <Button
            onClick={onCheck}
            className="w-full h-10 text-sm bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground dark:bg-primary dark:hover:bg-primary/90 dark:disabled:bg-muted dark:text-primary-foreground dark:disabled:text-muted-foreground transition-colors"
            disabled={!canCheck}
          >
            CHECK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50">
      <div className="container mx-auto max-w-2xl">
        <Button
          onClick={onNext}
          className={`w-full h-14 text-lg font-bold ${
            isCorrect
              ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          }`}
        >
          {isCorrect ? "✓ Correct! Continue" : "✗ Wrong. Continue"}
        </Button>
      </div>
    </div>
  );
};
