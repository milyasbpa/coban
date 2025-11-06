import React from "react";
import { Button } from "@/pwa/core/components/button";

interface ControlButtonsProps {
  canCheck: boolean;
  isAnswered: boolean;
  isCorrect?: boolean;
  onCheck: () => void;
  onNext: () => void;
  onResetAnswer: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  canCheck,
  isAnswered,
  isCorrect,
  onCheck,
  onNext,
  onResetAnswer,
}) => {
  if (!isAnswered) {
    return (
      <div className="flex gap-3">
        <Button
          onClick={onResetAnswer}
          variant="outline"
          className="flex-1"
          disabled={!canCheck}
        >
          Reset
        </Button>
        <Button
          onClick={onCheck}
          className="flex-1"
          disabled={!canCheck}
        >
          Check Answer
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onNext}
      className={`w-full ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
    >
      {isCorrect ? "✓ Correct! Continue" : "✗ Wrong. Continue"}
    </Button>
  );
};