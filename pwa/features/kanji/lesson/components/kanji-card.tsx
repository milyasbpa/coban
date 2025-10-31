"use client";

import { Badge } from "@/pwa/core/components/badge";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Heart } from "lucide-react";
import { KanjiDetail } from "../utils/kanji";

interface KanjiCardProps {
  kanji: KanjiDetail;
  index: number;
  onFavoriteToggle?: (kanjiId: number) => void;
  isFavorite?: boolean;
}

export function KanjiCard({ 
  kanji, 
  index, 
  onFavoriteToggle, 
  isFavorite = false 
}: KanjiCardProps) {
  const handleFavoriteClick = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(kanji.id);
    }
  };

  // Create stroke pattern visualization (simplified)
  const strokePattern = Array.from({ length: kanji.strokes }, (_, i) => (
    <div 
      key={i} 
      className="w-full h-1 bg-foreground rounded"
      style={{ 
        marginBottom: '2px',
        width: `${Math.max(60 - i * 5, 20)}%` // Simple pattern simulation
      }}
    />
  ));

  return (
    <Card className="p-4 space-y-4 relative">
      {/* Header with index and favorite */}
      <div className="flex justify-between items-start">
        <span className="text-sm text-muted-foreground">{index}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavoriteClick}
          className="p-1 h-8 w-8"
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </Button>
      </div>

      {/* Kanji character and stroke pattern */}
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-yellow-300 rounded-lg flex items-center justify-center relative">
          <span className="text-3xl font-bold text-black">{kanji.character}</span>
        </div>
        
        <div className="flex-1 space-y-2">
          {/* KUN reading */}
          <div className="space-y-1">
            <Badge variant="secondary" className="bg-black text-white text-xs px-2 py-1">
              KUN
            </Badge>
            <div className="text-sm">
              {kanji.readings.kun.map((reading, idx) => reading.furigana).join("、")}
            </div>
          </div>
          
          {/* ON reading */}
          <div className="space-y-1">
            <Badge variant="secondary" className="bg-black text-white text-xs px-2 py-1">
              ON
            </Badge>
            <div className="text-sm">
              {kanji.readings.on.map((reading, idx) => reading.furigana).join("、")}
            </div>
          </div>
        </div>
      </div>

      {/* Example words */}
      <div className="space-y-2 text-sm text-muted-foreground">
        {kanji.examples.slice(0, 3).map((example, idx) => (
          <div key={idx} className="flex">
            <span className="font-medium text-foreground">
              {example.word}
            </span>
            <span className="ml-2">
              【{example.furigana}】: {example.meaning_id}
            </span>
          </div>
        ))}
      </div>

      {/* Audio button (bottom right) */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          <div className="w-4 h-4 rounded-full bg-gray-500" />
        </Button>
      </div>
    </Card>
  );
}