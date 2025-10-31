"use client";

import { Card } from "@/pwa/core/components/card";
import { KanjiItem } from "../utils/kanji-list";

interface KanjiGridCardProps {
  kanji: KanjiItem;
  onClick?: (kanji: KanjiItem) => void;
}

export function KanjiGridCard({ kanji, onClick }: KanjiGridCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(kanji);
    }
  };

  return (
    <Card 
      className="aspect-square bg-accent hover:bg-accent/80 transition-colors cursor-pointer border-2 border-border hover:border-ring shadow-sm hover:shadow-md"
      onClick={handleClick}
    >
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-2xl md:text-3xl font-bold text-accent-foreground select-none">
          {kanji.character}
        </span>
      </div>
    </Card>
  );
}