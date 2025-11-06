"use client";

import { Card } from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { Volume2 } from "lucide-react";
import { VocabularyWord } from "@/pwa/core/services/vocabulary";
import { playAudio } from "@/pwa/core/lib/utils/audio";

interface VocabularyItemCardProps {
  vocabulary: VocabularyWord;
  index: number;
  onClick?: (vocabulary: VocabularyWord) => void;
}

export function VocabularyItemCard({ vocabulary, index, onClick }: VocabularyItemCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(vocabulary);
    }
  };

  const handleAudioClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    try {
      // Play hiragana pronunciation
      await playAudio(vocabulary.hiragana);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-border/50 hover:border-border"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {/* Index Number */}
        <div className="shrink-0">
          <span className="text-sm font-medium text-muted-foreground w-6 inline-block">
            {index}.
          </span>
        </div>

        {/* Vocabulary Content */}
        <div className="flex-1 space-y-1">
          {/* Hiragana (Pronunciation) */}
          <div className="text-lg font-medium text-foreground">
            {vocabulary.hiragana}
          </div>
          
          {/* Kanji */}
          <div className="text-2xl font-bold text-foreground">
            {vocabulary.kanji}
          </div>
          
          {/* Meanings */}
          <div className="space-y-0.5">
            <div className="text-sm text-red-500 font-medium">
              {vocabulary.meanings.en}
            </div>
            {vocabulary.meanings.id && (
              <div className="text-sm text-red-400">
                {vocabulary.meanings.id}
              </div>
            )}
          </div>
          
          {/* Romaji */}
          <div className="text-xs text-muted-foreground">
            {vocabulary.romaji}
          </div>
        </div>

        {/* Audio Button */}
        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAudioClick}
            className="w-10 h-10 p-0 rounded-full bg-yellow-400 hover:bg-yellow-500 border-yellow-400 hover:border-yellow-500"
          >
            <Volume2 className="h-4 w-4 text-black" />
          </Button>
        </div>
      </div>
    </Card>
  );
}