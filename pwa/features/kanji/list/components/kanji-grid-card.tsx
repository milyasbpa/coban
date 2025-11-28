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
      className="aspect-square bg-card hover:bg-muted/50 transition-all duration-200 cursor-pointer border border-border hover:border-primary/30 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="w-full h-full flex items-center justify-center p-2">
        <span className="text-2xl md:text-3xl font-bold text-foreground select-none">
          {kanji.character}
        </span>
      </div>
    </Card>
  );
}