"use client";

import { Button } from "@/pwa/core/components/button";
import { cn } from "@/pwa/core/lib/utils";

interface ModeSelectorProps {
  currentMode: "multiple-choice" | "direct-input";
  onModeChange: (mode: "multiple-choice" | "direct-input") => void;
  disabled?: boolean;
}

export function ModeSelector({ currentMode, onModeChange, disabled = false }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant="outline"
        className={cn(
          "flex-1 h-12",
          currentMode === "multiple-choice" && "bg-primary text-primary-foreground"
        )}
        onClick={() => onModeChange("multiple-choice")}
        disabled={disabled}
      >
        Multiple Choice
      </Button>
      <Button
        variant="outline"
        className={cn(
          "flex-1 h-12",
          currentMode === "direct-input" && "bg-primary text-primary-foreground"
        )}
        onClick={() => onModeChange("direct-input")}
        disabled={disabled}
      >
        Direct Input
      </Button>
    </div>
  );
}