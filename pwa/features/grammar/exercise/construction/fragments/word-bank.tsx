"use client";

import { Button } from "@/pwa/core/components/button";
import { WordTile } from "../types/construction.types";

interface WordBankProps {
  words: WordTile[];
  usedWords: string[];
  isChecked: boolean;
  onAddWord: (word: string) => void;
}

export function WordBank({
  words,
  usedWords,
  isChecked,
  onAddWord,
}: WordBankProps) {
  const isWordUsed = (word: string) => {
    return usedWords.filter(w => w === word).length >= words.filter(w => w.word === word).length;
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Available Words:</p>
      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border border-border min-h-[100px]">
        {words.map((tile) => {
          const used = isWordUsed(tile.word);
          return (
            <Button
              key={tile.id}
              variant="outline"
              className={`px-4 py-3 text-base font-medium transition-all ${
                used
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-primary hover:text-primary-foreground"
              }`}
              onClick={() => onAddWord(tile.word)}
              disabled={used || isChecked}
            >
              {tile.word}
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Tap a word to add it to your answer
      </p>
    </div>
  );
}
