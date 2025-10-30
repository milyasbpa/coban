"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/pwa/core/components/badge";
import { getLevelData } from "@/pwa/features/home/utils/levels";
import { LevelButton } from "../components/level-button";

interface LevelSectionProps {
  onLevelChange?: (level: string) => void;
}

export function LevelSection({ onLevelChange }: LevelSectionProps) {
  const levelData = getLevelData();
  const [selectedLevelId, setSelectedLevelId] = useState(
    levelData.levels[0]?.id || "n5"
  );

  const handleLevelClick = (levelId: string) => {
    setSelectedLevelId(levelId);
    // Convert id to uppercase format (n5 -> N5, n4 -> N4)
    const levelName = levelId.toUpperCase();
    onLevelChange?.(levelName);
  };

  // Call onLevelChange on initial render to set the default level
  useEffect(() => {
    const levelName = selectedLevelId.toUpperCase();
    onLevelChange?.(levelName);
  }, []);

  return (
    <div className="text-center mb-8">
      <Badge variant="secondary" className="mb-4 px-6 py-2 text-sm font-medium">
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
