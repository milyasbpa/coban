"use client";

import { Card } from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { Volume2 } from "lucide-react";
import { VocabularyWord } from "@/pwa/core/services/vocabulary";
import { playAudio } from "@/pwa/core/lib/utils/audio";
import { useVocabularyDisplayOptions } from "../store/display-options.store";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { cn } from "@/pwa/core/lib/utils";

interface VocabularyItemCardProps {
  vocabulary: VocabularyWord;
  index: number;
  onClick?: (vocabulary: VocabularyWord) => void;
}

export function VocabularyItemCard({
  vocabulary,
  index,
  onClick,
}: VocabularyItemCardProps) {
  const { displayOptions } = useVocabularyDisplayOptions();
  const { language } = useLanguage();
  const { isSelectionMode, selectedVocabularyIds, toggleVocabularySelection } =
    useVocabularySelection();
  const isSelected = selectedVocabularyIds.has(vocabulary.id);

  const handleClick = () => {
    if (isSelectionMode) {
      toggleVocabularySelection(vocabulary.id);
    } else if (onClick) {
      onClick(vocabulary);
    }
  };

  const handleAudioClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    try {
      // Play hiragana pronunciation
      await playAudio(vocabulary.hiragana);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200 cursor-pointer border",
        isSelectionMode && "hover:shadow-md",
        isSelected &&
          "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20",
        !isSelected &&
          isSelectionMode &&
          "border-border/50 hover:shadow-md hover:border-primary/30",
        !isSelectionMode && "border-border/50 hover:border-border hover:shadow-md"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Index Number */}
        <div className="shrink-0">
          <span
            className={cn(
              "text-sm font-medium px-2 py-1 rounded-md transition-colors",
              isSelected
                ? "text-primary-foreground bg-primary"
                : "text-muted-foreground bg-muted"
            )}
          >
            {index}
          </span>
        </div>

        {/* Vocabulary Content */}
        <div className="flex-1 space-y-1">
          {/* Hiragana (Pronunciation) */}
          {displayOptions.hiragana && (
            <div className="text-xs font-medium text-foreground">
              {vocabulary.hiragana}
            </div>
          )}

          {/* Kanji */}
          {displayOptions.japanese && (
            <div className="text-2xl font-bold text-foreground">
              {vocabulary.kanji}
            </div>
          )}

          {/* Meanings */}
          {displayOptions.meaning && (
            <div className="space-y-0.5">
              {language === "en" && (
                <div className="text-sm text-red-500 font-medium">
                  {vocabulary.meanings.en}
                </div>
              )}
              {language === "id" && (
                <div className="text-xs text-red-400">
                  {vocabulary.meanings.id}
                </div>
              )}
            </div>
          )}

          {/* Romaji */}
          {displayOptions.romanji && (
            <div className="text-xs text-muted-foreground">
              {vocabulary.romaji}
            </div>
          )}
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
