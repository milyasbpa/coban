"use client";

import { useState } from "react";
import { Card } from "@/pwa/core/components/card";
import { Volume2, ChevronDown, ChevronUp, MoreVertical, RotateCcw } from "lucide-react";
import { VocabularyWord } from "@/pwa/core/services/vocabulary";
import { playAudio } from "@/pwa/core/lib/utils/audio";
import { useVocabularyDisplayOptions } from "../store/display-options.store";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { cn } from "@/pwa/core/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/pwa/core/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/pwa/core/components/alert-dialog";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { 
  getMasteryLevel, 
  shouldDisplayMastery, 
  formatAccuracy,
  calculateAverageAccuracy 
} from "@/pwa/core/lib/utils/mastery";

interface VocabularyItemCardProps {
  vocabulary: VocabularyWord;
  index: number;
  onClick?: (vocabulary: VocabularyWord) => void;
  level: string;
  categoryId: string;
}

export function VocabularyItemCard({
  vocabulary,
  index,
  onClick,
  level,
  categoryId,
}: VocabularyItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { displayOptions } = useVocabularyDisplayOptions();
  const { language } = useLanguage();
  const { isSelectionMode, selectedVocabularyIds, toggleVocabularySelection } =
    useVocabularySelection();
  const { resetVocabularyStatistics, getVocabularyAccuracy } = useVocabularyScoreStore();
  const isSelected = selectedVocabularyIds.has(vocabulary.id);
  const hasExamples = vocabulary.examples && vocabulary.examples.length > 0;

  // Get vocabulary mastery level
  const vocabularyAccuracy = getVocabularyAccuracy(
    vocabulary.id.toString(),
    level,
    categoryId
  );
  const accuracy = vocabularyAccuracy || 0;
  const masteryConfig = getMasteryLevel(accuracy);
  const showMastery = shouldDisplayMastery(accuracy);

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

  const handleReset = async () => {
    try {
      await resetVocabularyStatistics(vocabulary.id.toString(), level, categoryId);
      setShowResetDialog(false);
    } catch (error) {
      console.error("Error resetting vocabulary statistics:", error);
    }
  };

  // Helper function to highlight matching consecutive characters from vocabulary word
  const highlightMatchingCharacters = (text: string, targetWord: string) => {
    if (!text || !targetWord) return text;

    const index = text.indexOf(targetWord);
    if (index === -1) return text;

    const result: React.ReactNode[] = [];
    let currentIndex = 0;
    let searchIndex = text.indexOf(targetWord, currentIndex);

    while (searchIndex !== -1) {
      // Add text before match
      if (searchIndex > currentIndex) {
        result.push(text.slice(currentIndex, searchIndex));
      }

      // Add highlighted match
      result.push(
        <span
          key={`${searchIndex}-${targetWord}`}
          className={cn(
            "font-bold transition-colors rounded px-0.5",
            isSelected
              ? "text-primary bg-primary/20"
              : "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30"
          )}
        >
          {text.slice(searchIndex, searchIndex + targetWord.length)}
        </span>
      );

      currentIndex = searchIndex + targetWord.length;
      searchIndex = text.indexOf(targetWord, currentIndex);
    }

    // Add remaining text
    if (currentIndex < text.length) {
      result.push(text.slice(currentIndex));
    }

    return result.length > 0 ? result : text;
  };

  // Helper function to highlight meanings (handles comma-separated meanings)
  const highlightMatchingMeanings = (text: string, vocabularyMeaning: string) => {
    if (!text || !vocabularyMeaning) return text;

    // Split vocabulary meaning by comma and trim whitespace
    const meaningWords = vocabularyMeaning
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    // If no words found, return original text
    if (meaningWords.length === 0) return text;

    // Sort by length (longest first) to avoid partial matches
    meaningWords.sort((a, b) => b.length - a.length);

    let remainingText = text;
    const result: React.ReactNode[] = [];
    let keyCounter = 0;

    // Process text character by character
    let currentIndex = 0;
    while (currentIndex < remainingText.length) {
      let matched = false;

      // Try to match each meaning word at current position
      for (const word of meaningWords) {
        const restOfText = remainingText.slice(currentIndex);
        const lowerRestOfText = restOfText.toLowerCase();
        const lowerWord = word.toLowerCase();

        // Check if word matches at current position (case insensitive)
        if (lowerRestOfText.startsWith(lowerWord)) {
          // Check boundaries - word should be standalone (not part of bigger word)
          const charBefore = currentIndex > 0 ? remainingText[currentIndex - 1] : ' ';
          const charAfter = currentIndex + word.length < remainingText.length 
            ? remainingText[currentIndex + word.length] 
            : ' ';
          
          const isWordBoundaryBefore = /[\s,;.!?]/.test(charBefore);
          const isWordBoundaryAfter = /[\s,;.!?]/.test(charAfter);

          if (isWordBoundaryBefore && isWordBoundaryAfter) {
            // Add matched word with highlight
            result.push(
              <span
                key={`meaning-${keyCounter++}`}
                className={cn(
                  "font-bold transition-colors rounded px-0.5",
                  isSelected
                    ? "text-primary bg-primary/20"
                    : "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30"
                )}
              >
                {remainingText.slice(currentIndex, currentIndex + word.length)}
              </span>
            );
            currentIndex += word.length;
            matched = true;
            break;
          }
        }
      }

      // If no match found, add current character
      if (!matched) {
        // Collect unmatched characters until next potential match
        let unmatchedText = '';
        let tempIndex = currentIndex;
        let foundNextMatch = false;

        while (tempIndex < remainingText.length && !foundNextMatch) {
          unmatchedText += remainingText[tempIndex];
          tempIndex++;

          // Check if next position could be a match
          for (const word of meaningWords) {
            const restOfText = remainingText.slice(tempIndex);
            if (restOfText.toLowerCase().startsWith(word.toLowerCase())) {
              foundNextMatch = true;
              break;
            }
          }
        }

        if (unmatchedText) {
          result.push(unmatchedText);
          currentIndex += unmatchedText.length;
        } else {
          // Safety fallback
          result.push(remainingText[currentIndex]);
          currentIndex++;
        }
      }
    }

    return result.length > 0 ? result : text;
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
              <p className="text-xs text-foreground/80 font-semibold select-text">
                {vocabulary.hiragana}
              </p>
            )}

            {/* Kanji - Main Focus */}
            {displayOptions.japanese && (
              <p className="text-3xl font-bold text-foreground leading-none tracking-tight select-text">
                {vocabulary.kanji}
              </p>
            )}

            {/* Bottom Row: Romaji • Meaning */}
            {(displayOptions.romanji || displayOptions.meaning) && (
              <div className="flex items-center gap-2 flex-wrap">
                {displayOptions.romanji && (
                  <span className="text-sm text-muted-foreground font-medium select-text">
                    {vocabulary.romaji}
                  </span>
                )}
                {displayOptions.romanji && displayOptions.meaning && (
                  <span className="text-muted-foreground/30 text-sm">•</span>
                )}
                {displayOptions.meaning && (
                  <span className="text-sm text-foreground font-semibold select-text">
                    {language === "en"
                      ? vocabulary.meanings.en
                      : vocabulary.meanings.id}
                  </span>
                )}
              </div>
            )}

            {/* Mastery Badge - Small chip below content */}
            {showMastery && (
              <div className="mt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors",
                    masteryConfig.colorClasses.bg,
                    masteryConfig.colorClasses.text
                  )}
                >
                  {formatAccuracy(accuracy)}
                </span>
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

            {/* 3-Dot Menu - Only show when not in selection mode */}
            {!isSelectionMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-lg bg-muted hover:bg-muted flex items-center justify-center transition-all duration-200"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowResetDialog(true);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Statistics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
                      <div className="text-sm font-bold text-foreground leading-relaxed select-text">
                        {highlightMatchingCharacters(
                          example.sentence,
                          vocabulary.kanji
                        )}
                      </div>
                    )}
                    {/* Furigana */}
                    {displayOptions.hiragana && (
                      <div className="text-[10px] text-muted-foreground font-normal leading-relaxed select-text">
                        {highlightMatchingCharacters(
                          example.furigana,
                          vocabulary.hiragana
                        )}
                      </div>
                    )}

                    {/* Romaji */}
                    {displayOptions.romanji && (
                      <div className="text-xs text-muted-foreground font-medium leading-relaxed select-text">
                        {highlightMatchingCharacters(
                          example.romaji,
                          vocabulary.romaji
                        )}
                      </div>
                    )}

                    {/* Translation */}
                    {displayOptions.meaning && (
                      <div className="text-xs text-foreground/90 font-semibold leading-relaxed select-text">
                        {language === "en"
                          ? highlightMatchingMeanings(
                              example.meanings.en,
                              vocabulary.meanings.en
                            )
                          : highlightMatchingMeanings(
                              example.meanings.id,
                              vocabulary.meanings.id
                            )}
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

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Statistics?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all progress and statistics for &quot;{vocabulary.kanji}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
