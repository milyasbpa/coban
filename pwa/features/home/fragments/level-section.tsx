"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/pwa/core/components/badge";
import { getLevelData } from "@/pwa/features/home/utils/levels";
import { LevelButton } from "../components/level-button";
import { useHomeSettingsStore } from "../store/home-settings.store";

export function LevelSection() {
  const levelData = getLevelData();
  const { selectedLevel, setSelectedLevel } = useHomeSettingsStore();
  
  // Convert persisted level to lowercase id format (N5 -> n5)
  const [selectedLevelId, setSelectedLevelId] = useState(
    selectedLevel.toLowerCase() || levelData.levels[0]?.id || "n5"
  );

  const handleLevelClick = (levelId: string) => {
    setSelectedLevelId(levelId);
    // Convert id to uppercase format (n5 -> N5, n4 -> N4)
    const levelName = levelId.toUpperCase();
    setSelectedLevel(levelName); // Use store directly
  };

  // Sync with persisted state on mount
  useEffect(() => {
    const persistedLevelId = selectedLevel.toLowerCase();
    if (persistedLevelId && persistedLevelId !== selectedLevelId) {
      setSelectedLevelId(persistedLevelId);
    }
  }, [selectedLevel, selectedLevelId]);

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
