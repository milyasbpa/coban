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
        "relative p-2.5 transition-all duration-200 cursor-pointer overflow-hidden",
        // Base state - visible background with elevation
        "bg-muted/60 backdrop-blur-sm border border-border/40 shadow-md",
        // Hover states
        !isSelected &&
          !isSelectionMode &&
          "hover:bg-muted/50 hover:border-border/60 hover:shadow-lg",
        !isSelected &&
          isSelectionMode &&
          "hover:bg-muted/40 hover:shadow-lg hover:border-primary/40",
        // Selected state - prominent
        isSelected &&
          "border-primary bg-primary/10 shadow-xl ring-2 ring-primary/20"
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
              <div className="text-xs text-foreground/80 font-semibold">
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
                  <span className="text-sm text-muted-foreground font-medium">
                    {vocabulary.romaji}
                  </span>
                )}
                {displayOptions.romanji && displayOptions.meaning && (
                  <span className="text-muted-foreground/30 text-sm">•</span>
                )}
                {displayOptions.meaning && (
                  <span className="text-sm text-foreground font-semibold">
                    {language === "en"
                      ? vocabulary.meanings.en
                      : vocabulary.meanings.id}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Audio Button + Chevron */}
          <div className="shrink-0 flex items-start gap-1">
            {/* Audio Button - Subtle Design */}
            <button
              onClick={handleAudioClick}
              className="group w-9 h-9 rounded-lg bg-muted hover:bg-muted flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Volume2 className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
            </button>

            {/* Chevron Toggle - Only if has examples */}
            {hasExamples && (
              <button
                onClick={toggleExpand}
                className="w-9 h-9 rounded-lg bg-muted hover:bg-muted flex items-center justify-center transition-all duration-200"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Examples Section - Cleaner Design */}
      {hasExamples && isExpanded && (
        <div className="mt-2 pt-2 border-t border-border/20">
          <div className="space-y-2">
            {vocabulary.examples?.map((example, idx) => (
              <div
                key={example.id}
                className="bg-accent/20 rounded-lg p-2.5 hover:bg-accent/40 transition-colors border border-border/30"
              >
                <div className="flex items-start gap-2.5">
                  {/* Example Number Badge */}
                  <span className="shrink-0 w-5 h-5 rounded-md bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>

                  {/* Example Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Sentence */}
                    {displayOptions.japanese && (
                      <div className="text-sm font-bold text-foreground leading-relaxed">
                        {example.sentence}
                      </div>
                    )}
                    {/* Furigana */}
                    {displayOptions.hiragana && (
                      <div className="text-[10px] text-muted-foreground font-normal leading-relaxed">
                        {example.furigana}
                      </div>
                    )}

                    {/* Translation */}
                    {displayOptions.meaning && (
                      <div className="text-xs text-foreground/90 font-semibold leading-relaxed">
                        {language === "en"
                          ? example.meanings.en
                          : example.meanings.id}
                      </div>
                    )}

                    {/* Romaji */}
                    {displayOptions.romanji && (
                      <div className="text-xs text-muted-foreground font-medium leading-relaxed">
                        {example.romaji}
                      </div>
                    )}
                  </div>

                  {/* Example Audio - Subtle Design */}
                  <button
                    onClick={(e) =>
                      handleExampleAudioClick(e, example.furigana)
                    }
                    className="shrink-0 w-7 h-7 rounded-lg bg-accent/40 hover:bg-muted flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <Volume2 className="h-3 w-3 text-foreground/60" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
