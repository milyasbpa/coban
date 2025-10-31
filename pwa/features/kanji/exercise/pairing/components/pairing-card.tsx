"use client";

import { Card } from "@/pwa/core/components/card";
import { cn } from "@/pwa/core/lib/utils";

interface PairingCardProps {
  id: string;
  content: string;
  type: "kanji" | "meaning";
  isSelected: boolean;
  isMatched: boolean;
  isError: boolean;
  onClick: (id: string, type: "kanji" | "meaning") => void;
}

export function PairingCard({ 
  id, 
  content, 
  type, 
  isSelected, 
  isMatched, 
  isError, 
  onClick 
}: PairingCardProps) {
  const handleClick = () => {
    if (isMatched) return; // Don't allow clicking matched cards
    onClick(id, type);
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 select-none min-h-[80px] flex items-center justify-center text-center",
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
      <div className="w-full">
        {type === "kanji" ? (
          <div className="text-lg font-bold">{content}</div>
        ) : (
          <div className="text-sm font-medium leading-tight">{content}</div>
        )}
      </div>
    </Card>
  );
}