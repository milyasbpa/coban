"use client";

import { useState } from "react";
import { Card } from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { Volume2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { displayOptions } = useVocabularyDisplayOptions();
  const { language } = useLanguage();
  const { isSelectionMode, selectedVocabularyIds, toggleVocabularySelection } =
    useVocabularySelection();
  const isSelected = selectedVocabularyIds.has(vocabulary.id);
  const hasExamples = vocabulary.examples && vocabulary.examples.length > 0;

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

  const handleExampleAudioClick = async (
    e: React.MouseEvent,
    furigana: string
  ) => {
    e.stopPropagation();
    try {
      await playAudio(furigana);
    } catch (error) {
      console.error("Error playing example audio:", error);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelectionMode) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card
      className={cn(
        "relative p-2.5 transition-all duration-200 cursor-pointer border overflow-hidden",
        isSelectionMode && "hover:shadow-md",
        isSelected &&
          "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20",
        !isSelected &&
          isSelectionMode &&
          "border-border/50 hover:shadow-md hover:border-primary/30",
        !isSelectionMode &&
          "border-border/50 hover:border-border hover:shadow-md"
      )}
      onClick={handleClick}
    >
      {/* Index Badge - Absolute Position */}
      <div className="absolute top-2 left-2">
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors",
            isSelected
              ? "text-primary-foreground bg-primary"
              : "text-muted-foreground bg-muted"
          )}
        >
          {index}
        </span>
      </div>

      {/* Main Content Container */}
      <div className="pl-8 pr-1">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Vertical Stack */}
          <div className="flex-1 space-y-1">
            {/* Hiragana - Subtle at top */}
            {displayOptions.hiragana && (
              <div className="text-xs text-muted-foreground/80 font-medium">
                {vocabulary.hiragana}
              </div>
            )}

            {/* Kanji - Main Focus */}
            {displayOptions.japanese && (
              <div className="text-3xl font-bold text-foreground leading-none tracking-tight">
                {vocabulary.kanji}
              </div>
            )}

            {/* Bottom Row: Romaji • Meaning */}
            {(displayOptions.romanji || displayOptions.meaning) && (
              <div className="flex items-center gap-2 flex-wrap">
                {displayOptions.romanji && (
                  <span className="text-sm text-muted-foreground/80">
                    {vocabulary.romaji}
                  </span>
                )}
                {displayOptions.romanji && displayOptions.meaning && (
                  <span className="text-muted-foreground/40 text-sm">•</span>
                )}
                {displayOptions.meaning && (
                  <span className="text-sm text-foreground/90 font-medium">
                    {language === "en"
                      ? vocabulary.meanings.en
                      : vocabulary.meanings.id}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Audio Button */}
          <button
            onClick={handleAudioClick}
            className="shrink-0 w-10 h-10 rounded-full bg-foreground hover:bg-foreground/90 flex items-center justify-center transition-colors shadow-sm"
          >
            <Volume2 className="h-4 w-4 text-background" />
          </button>
        </div>
      </div>

      {/* Examples Section - Cleaner Design */}
      {hasExamples && (
        <div className="mt-2 pt-2 border-t border-border/20">
          {/* Compact Toggle */}
          <button
            onClick={toggleExpand}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span className="text-[10px] font-semibold">
                  {vocabulary.examples?.length} examples
                </span>
              </>
            )}
          </button>

          {/* Examples List - Redesigned */}
          {isExpanded && vocabulary.examples && (
            <div className="mt-2 space-y-2">
              {vocabulary.examples.map((example, idx) => (
                <div
                  key={example.id}
                  className="bg-muted/30 rounded-md p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {/* Example Number Badge */}
                    <span className="shrink-0 w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>

                    {/* Example Content */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      {/* Furigana */}
                      {displayOptions.hiragana && (
                        <div className="text-[10px] text-muted-foreground">
                          {example.furigana}
                        </div>
                      )}

                      {/* Sentence */}
                      {displayOptions.japanese && (
                        <div className="text-xs font-semibold text-foreground">
                          {example.sentence}
                        </div>
                      )}

                      {/* Translation */}
                      {displayOptions.meaning && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400">
                          {language === "en"
                            ? example.meanings.en
                            : example.meanings.id}
                        </div>
                      )}

                      {/* Romaji */}
                      {displayOptions.romanji && (
                        <div className="text-[10px] text-muted-foreground/60">
                          {example.romaji}
                        </div>
                      )}
                    </div>

                    {/* Example Audio - Smaller */}
                    <button
                      onClick={(e) =>
                        handleExampleAudioClick(e, example.furigana)
                      }
                      className="shrink-0 w-7 h-7 rounded-full bg-foreground/80 hover:bg-foreground flex items-center justify-center transition-colors"
                    >
                      <Volume2 className="h-3 w-3 text-background" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
