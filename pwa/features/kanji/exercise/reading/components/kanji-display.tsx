"use client";

import { Card } from "@/pwa/core/components/card";

interface KanjiDisplayProps {
  kanji: string;
  showFurigana?: boolean;
  furigana?: string;
}

export function KanjiDisplay({ kanji, showFurigana = false, furigana }: KanjiDisplayProps) {
  return (
    <Card className="w-32 h-32 mx-auto bg-card border-2 border-border flex flex-col items-center justify-center">
      {showFurigana && furigana && (
        <div className="text-sm text-muted-foreground mb-1">{furigana}</div>
      )}
      <div className="text-4xl font-bold text-foreground">{kanji}</div>
    </Card>
  );
}