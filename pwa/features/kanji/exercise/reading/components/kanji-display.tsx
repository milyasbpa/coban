"use client";

import { Card } from "@/pwa/core/components/card";

interface KanjiDisplayProps {
  kanji: string;
  romanji?: string;
  showRomanji?: boolean;
  onClick?: () => void;
}

export function KanjiDisplay({
  kanji,
  romanji,
  showRomanji,
  onClick,
}: KanjiDisplayProps) {
  return (
    <Card
      className="w-32 h-32 mx-auto bg-linear-to-br from-amber-100 to-amber-200 dark:from-amber-200/20 dark:to-amber-300/20 border-amber-200/50 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors"
      onClick={onClick}
    >
      {showRomanji && romanji && (
        <div className="text-sm text-muted-foreground mb-1">{romanji}</div>
      )}
      <div className="text-4xl font-bold text-foreground">{kanji}</div>
    </Card>
  );
}
