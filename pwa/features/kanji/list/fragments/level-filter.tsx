"use client";

import { Button } from "@/pwa/core/components/button";

interface LevelFilterProps {
  levels: string[];
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}

export function LevelFilter({ levels, selectedLevel, onLevelChange }: LevelFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4">
      {levels.map((level) => (
        <Button
          key={level}
          variant={selectedLevel === level ? "default" : "secondary"}
          size="sm"
          onClick={() => onLevelChange(level)}
          className={`whitespace-nowrap ${
            selectedLevel === level 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {level}
        </Button>
      ))}
    </div>
  );
}