"use client";

import { Button } from "@/pwa/core/components/button";
import { cn } from "@/pwa/core/lib/utils";
import { useReadingExerciseStore } from "../store";

export function ReadingModeSelector() {
  const { questionState: { inputMode, isAnswered }, setInputMode } = useReadingExerciseStore();
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant="outline"
        className={cn(
          "flex-1 h-12",
          inputMode === "multiple-choice" && "bg-primary text-primary-foreground"
        )}
        onClick={() => setInputMode("multiple-choice")}
        disabled={isAnswered}
      >
        Multiple Choice
      </Button>
      <Button
        variant="outline"
        className={cn(
          "flex-1 h-12",
          inputMode === "direct-input" && "bg-primary text-primary-foreground"
        )}
        onClick={() => setInputMode("direct-input")}
        disabled={isAnswered}
      >
        Direct Input
      </Button>
    </div>
  );
}