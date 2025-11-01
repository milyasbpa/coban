"use client";

import { Card } from "@/pwa/core/components/card";
import { cn } from "@/pwa/core/lib/utils";
import { usePairingDisplayOptions } from "../store";

interface PairingCardProps {
  id: string;
  content: string;
  furigana?: string;
  romanji?: string;
  type: "kanji" | "meaning";
  isSelected: boolean;
  isMatched: boolean;
  isError: boolean;
  onClick: (id: string, type: "kanji" | "meaning") => void;
}

export function PairingCard({ 
  id, 
  content, 
  furigana,
  romanji,
  type, 
  isSelected, 
  isMatched, 
  isError, 
  onClick 
}: PairingCardProps) {
  const { displayFurigana, displayRomanji } = usePairingDisplayOptions();

  const handleClick = () => {
    if (isMatched) return; // Don't allow clicking matched cards
    onClick(id, type);
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 select-none flex items-center justify-center text-center",
        // Consistent height for both card types
        "min-h-[100px]",
        {
          // Default state
          "bg-card hover:bg-muted/50 border-border": !isSelected && !isMatched && !isError,
          
          // Selected state
          "bg-primary/20 border-primary border-2": isSelected && !isError,
          
          // Matched state (success)
          "bg-green-100 border-green-500 border-2 text-green-800": isMatched,
          
          // Error state
          "bg-red-100 border-red-500 border-2 text-red-800 animate-pulse": isError,
          
          // Disable hover for matched cards
          "cursor-not-allowed": isMatched,
        }
      )}
      onClick={handleClick}
    >
      <div className="w-full flex flex-col items-center justify-center gap-1">
        {type === "kanji" ? (
          <>
            {/* Furigana (atas kanji) */}
            {displayFurigana && furigana && (
              <div className="text-xs text-muted-foreground font-medium leading-tight">
                {furigana}
              </div>
            )}
            
            {/* Kanji content (utama) */}
            <div className="text-lg font-bold leading-tight">{content}</div>
            
            {/* Romanji (bawah kanji) */}
            {displayRomanji && romanji && (
              <div className="text-xs text-muted-foreground font-medium leading-tight">
                {romanji}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm font-medium leading-tight px-2">{content}</div>
        )}
      </div>
    </Card>
  );
}