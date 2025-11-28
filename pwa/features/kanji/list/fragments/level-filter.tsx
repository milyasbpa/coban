"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/pwa/core/components/button";
import { getAvailableLevels } from "../utils/kanji-list";

export function LevelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const levelFromUrl = searchParams.get('level') || 'N5';
  const [selectedLevel, setSelectedLevel] = useState(levelFromUrl);
  const levels = getAvailableLevels();

  // Update selected level when URL changes
  useEffect(() => {
    const levelFromUrl = searchParams.get('level') || 'N5';
    setSelectedLevel(levelFromUrl);
  }, [searchParams]);

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    // Update URL with new level parameter
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('level', level);
    router.replace(newUrl.pathname + newUrl.search);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
      {levels.map((level) => (
        <Button
          key={level}
          variant={selectedLevel === level ? "default" : "outline"}
          size="sm"
          onClick={() => handleLevelChange(level)}
          className={`whitespace-nowrap transition-all ${
            selectedLevel === level 
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
              : "bg-card text-foreground hover:bg-muted border-border"
          }`}
        >
          {level}
        </Button>
      ))}
    </div>
  );
}