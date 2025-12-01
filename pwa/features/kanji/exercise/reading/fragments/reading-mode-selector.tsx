"use client";

import { Button } from "@/pwa/core/components/button";
import { cn } from "@/pwa/core/lib/utils";
import { useReadingExerciseStore } from "../store";

export function ReadingModeSelector() {
  const { questionState: { inputMode }, getIsAnswered, setInputMode } = useReadingExerciseStore();
  const isAnswered = getIsAnswered();
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant="outline"
        className={cn(
          "flex-1 h-12 transition-colors",
          inputMode === "multiple-choice" 
            ? "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" 
            : "bg-background hover:bg-accent dark:bg-background dark:hover:bg-accent"
        )}
        onClick={() => setInputMode("multiple-choice")}
        disabled={isAnswered}
      >
        Multiple Choice
      </Button>
      <Button
        variant="outline"
        className={cn(
          "flex-1 h-12 transition-colors",
          inputMode === "direct-input" 
            ? "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" 
            : "bg-background hover:bg-accent dark:bg-background dark:hover:bg-accent"
        )}
        onClick={() => setInputMode("direct-input")}
        disabled={isAnswered}
      >
        Direct Input
      </Button>
    </div>
  );
}