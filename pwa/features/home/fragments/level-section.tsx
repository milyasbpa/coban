"use client";

import { useState } from "react";
import { Badge } from "@/pwa/core/components/badge";
import { getLevelData } from "@/pwa/core/data/levels";
import { LevelButton } from "../components/level-button";

export function LevelSection() {
  const levelData = getLevelData();
  const [selectedLevelId, setSelectedLevelId] = useState(levelData.levels[0]?.id || "n5");

  const handleLevelClick = (levelId: string) => {
    setSelectedLevelId(levelId);
  };

  return (
    <div className="text-center mb-8">
      <Badge
        variant="secondary"
        className="mb-4 px-6 py-2 text-sm font-medium"
        style={{
          backgroundColor: "var(--character-dark)",
          color: "var(--foreground)",
        }}
      >
        Level
      </Badge>

      <div className="flex justify-center gap-4 mb-8">
        {levelData.levels.map((level) => (
          <LevelButton
            key={level.id}
            level={level}
            isActive={selectedLevelId === level.id}
            onClick={handleLevelClick}
          />
        ))}
      </div>
    </div>
  );
}