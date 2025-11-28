"use client";

import { Card } from "@/pwa/core/components/card";
import { KanjiItem } from "../utils/kanji-list";
import { getAccuracyColor } from "../utils/accuracy-colors";
import { cn } from "@/pwa/core/lib/utils";

interface KanjiGridCardProps {
  kanji: KanjiItem;
  onClick?: (kanji: KanjiItem) => void;
  accuracy?: number | null; // Accuracy percentage (0-100) or null if not attempted
}

export function KanjiGridCard({ kanji, onClick, accuracy }: KanjiGridCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(kanji);
    }
  };

  const colors = getAccuracyColor(accuracy ?? null);

  return (
    <Card 
      className="aspect-square bg-card hover:bg-muted/50 transition-all duration-200 cursor-pointer border border-border hover:border-primary/30 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="w-full h-full flex items-center justify-center p-2">
        <span className={cn(
          "text-2xl md:text-3xl font-bold select-none",
          colors.text
        )}>
          {kanji.character}
        </span>
      </div>
    </Card>
  );
}