"use client";

import { Badge } from "@/pwa/core/components/badge";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Volume2, MoreVertical, RotateCcw, Edit3, Book, Users } from "lucide-react";
import { KanjiDetail } from "../utils/kanji";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { useKanjiSelection } from "../store/kanji-selection.store";
import {
  getMeaning,
  getLocalizedText,
  SupportedLanguage,
} from "../../shared/utils/language-helpers";
import { useDisplayOptions } from "../store/display-options.store";
import { cn } from "@/pwa/core/lib/utils";
import { playAudio } from "@/pwa/core/lib/utils/audio";
import { KanjiStrokeAnimator } from "./kanji-stroke-animator";
import { useState, useMemo } from "react";
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
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import {
  getMasteryLevel,
  formatAccuracy,
} from "@/pwa/core/lib/utils/mastery";

interface KanjiCardProps {
  kanji: KanjiDetail;
  index: number;
  level: string;
}

export function KanjiCard({ kanji, index, level }: KanjiCardProps) {
  const { language } = useLanguage();
  const { isSelectionMode, selectedKanjiIds, toggleKanjiSelection } =
    useKanjiSelection();
  const { displayOptions } = useDisplayOptions();
  const { resetKanjiStatistics, getKanjiAccuracy, currentUserScore } = useKanjiScoreStore();
  const isSelected = selectedKanjiIds.has(kanji.id);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Get kanji mastery level
  const kanjiAccuracy = getKanjiAccuracy(kanji.id.toString(), level);
  // getKanjiAccuracy returns null if no attempts, or 0-100 if there are attempts
  // We want to show badge when user has attempted (even if accuracy is 0%), not when no attempts yet
  const accuracy = kanjiAccuracy ?? 0;
  const hasAttempts = kanjiAccuracy !== null;
  const masteryConfig = getMasteryLevel(accuracy);
  const showMastery = hasAttempts; // Show badge if user has made any attempts, regardless of accuracy

  // Calculate exercise completion status
  const exerciseStatus = useMemo(() => {
    const kanjiMastery = currentUserScore?.kanjiMastery[level]?.[kanji.id.toString()];
    
    if (!kanjiMastery?.words) {
      return {
        writing: false,
        reading: false,
        pairing: false,
      };
    }
    
    // Check if any word in this kanji has completed each exercise type
    const words = Object.values(kanjiMastery.words);
    return {
      writing: words.some((word) => (word.exerciseScores?.writing ?? 0) > 0),
      reading: words.some((word) => (word.exerciseScores?.reading ?? 0) > 0),
      pairing: words.some((word) => (word.exerciseScores?.pairing ?? 0) > 0),
    };
  }, [currentUserScore, level, kanji.id]);

  const handleCardClick = () => {
    if (isSelectionMode) {
      toggleKanjiSelection(kanji.id);
    }
  };

  const handleKanjiClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!isSelectionMode && !isAnimating) {
      setIsAnimating(true);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const handleReset = async () => {
    try {
      await resetKanjiStatistics(kanji.id.toString(), level);
      setShowResetDialog(false);
    } catch (error) {
      console.error("Error resetting kanji statistics:", error);
    }
  };

  const kanjiMeaning = getMeaning(kanji, language as SupportedLanguage);

  // Helper function to highlight matching kanji characters
  const highlightMatchingKanji = (word: string, targetKanji: string) => {
    const parts = word.split("").map((char, index) => {
      if (char === targetKanji) {
        return (
          <span
            key={index}
            className={cn(
              "font-bold transition-colors rounded px-0.5",
              isSelected
                ? "text-primary bg-primary/20"
                : "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30"
            )}
          >
            {char}
          </span>
        );
      }
      return char;
    });
    return parts;
  };

  return (
    <Card
      className={cn(
        "p-4 space-y-0 bg-card border transition-all duration-200 cursor-pointer gap-2",
        isSelectionMode && "hover:shadow-md",
        isSelected &&
          "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20",
        !isSelected &&
          isSelectionMode &&
          "border-border shadow-sm hover:shadow-md hover:border-primary/30",
        !isSelectionMode && "border-border shadow-sm hover:shadow-md"
      )}
      onClick={handleCardClick}
    >
      {/* Main layout - flex start */}
      <div className="flex gap-3 items-start">
        {/* Index and Kanji on same row */}
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-1">
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

          <div className="flex flex-col items-center justify-start space-y-1">
            {/* Kanji character display */}
            <div
              className={cn(
                "w-16 h-16 rounded-lg flex items-center justify-center border shadow-inner transition-colors",
                !isSelectionMode &&
                  !isAnimating &&
                  "cursor-pointer hover:shadow-lg",
                isSelected
                  ? "bg-linear-to-br from-primary/20 to-primary/30 border-primary/50"
                  : "bg-linear-to-br from-amber-100 to-amber-200 dark:from-amber-200/20 dark:to-amber-300/20 border-amber-200/50"
              )}
              onClick={handleKanjiClick}
            >
              {isAnimating ? (
                <KanjiStrokeAnimator
                  character={kanji.character}
                  isAnimating={isAnimating}
                  onAnimationComplete={handleAnimationComplete}
                  showStrokeOrder={true}
                  animationSpeed="normal"
                  isSelected={isSelected}
                />
              ) : (
                <span
                  className={cn(
                    "text-2xl font-bold select-none transition-colors",
                    isSelected
                      ? "text-primary"
                      : "text-amber-900 dark:text-amber-100"
                  )}
                >
                  {kanji.character}
                </span>
              )}
            </div>

            {/* Kanji meaning */}
            {displayOptions.meaning && (
              <div className="text-xs font-medium text-muted-foreground text-center max-w-16">
                {kanjiMeaning}
              </div>
            )}

            {/* Mastery Badge and Exercise Status Icons */}
            <div className="flex items-center gap-1 mt-0.5">
              {/* Mastery Badge */}
              {showMastery && (
                <span
                  className={cn(
                    "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors",
                    masteryConfig.colorClasses.bg,
                    masteryConfig.colorClasses.text
                  )}
                >
                  {formatAccuracy(accuracy)}
                </span>
              )}

              {/* Exercise Status Icons */}
              <div className="flex items-center gap-0.5">
                {/* Writing */}
                <div
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center transition-colors",
                    exerciseStatus.writing
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                  title="Writing Exercise"
                >
                  <Edit3 className="h-2.5 w-2.5" />
                </div>

                {/* Reading */}
                <div
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center transition-colors",
                    exerciseStatus.reading
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                  title="Reading Exercise"
                >
                  <Book className="h-2.5 w-2.5" />
                </div>

                {/* Pairing */}
                <div
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center transition-colors",
                    exerciseStatus.pairing
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                  title="Pairing Exercise"
                >
                  <Users className="h-2.5 w-2.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Readings */}
        <div className="flex-1 space-y-2">
          {/* KUN reading */}
          {!!kanji.readings.kun.length && (
            <div className="flex items-start gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 transition-colors",
                  isSelected
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                KUN
              </Badge>
              <span className="text-sm font-medium text-foreground">
                {kanji.readings.kun
                  .map((reading) => `${reading.furigana} (${reading.romanji})`)
                  .join("、")}
              </span>
            </div>
          )}

          {/* ON reading */}
          {!!kanji.readings.on.length && (
            <div className="flex items-start gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 transition-colors",
                  isSelected
                    ? "bg-secondary/80 text-secondary-foreground border-primary/20"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                ON
              </Badge>
              <span className="text-sm font-medium text-foreground">
                {kanji.readings.on
                  .map((reading) => `${reading.furigana} (${reading.romanji})`)
                  .join("、")}
              </span>
            </div>
          )}
        </div>

        {/* 3-Dot Menu - Only show when not in selection mode */}
        {!isSelectionMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
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
      </div>

      {/* Words Section Badge */}
      <div className="flex items-center gap-2 pt-2">
        <Badge
          variant="secondary"
          className={cn(
            "text-xs font-semibold px-2 py-0.5 transition-colors",
            isSelected
              ? "bg-primary/80 text-primary-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {getLocalizedText(language as SupportedLanguage, "Kata", "Words")}
        </Badge>
        <div className="flex-1 h-px bg-border/20"></div>
      </div>

      {/* Example words */}
      <div className="space-y-1.5 pt-1">
        {[
          ...(kanji.readings.kun.flatMap(r => r.examples || [])),
          ...(kanji.readings.on.flatMap(r => r.examples || [])),
          ...(kanji.readings.exception?.examples || [])
        ].map((example, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm"
          >
            {/* Word content with fixed layout */}
            <div className="grid grid-cols-[auto_1fr] gap-2 items-baseline min-w-0">
              {/* Left side - Word and readings */}
              <div className="flex items-baseline gap-1 shrink-0">
                {displayOptions.japanese && (
                  <span className="font-semibold text-foreground">
                    {highlightMatchingKanji(example.word, kanji.character)}
                  </span>
                )}
                {displayOptions.furigana && (
                  <span className="text-muted-foreground text-xs">
                    【{example.furigana}】
                  </span>
                )}
                {displayOptions.romanji && (
                  <span className="text-muted-foreground">
                    ({example.romanji})
                  </span>
                )}
              </div>

              {/* Right side - Colon and meaning with consistent alignment */}
              {displayOptions.meaning && (
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-muted-foreground shrink-0">:</span>
                  <span className="text-muted-foreground truncate">
                    {getMeaning(example, language as SupportedLanguage)}
                  </span>
                </div>
              )}
            </div>

            {/* Audio button for each word */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                playAudio(example.furigana);
              }}
              className="w-6 h-6 p-0 rounded-full bg-muted hover:bg-accent/20 border border-border transition-colors shrink-0"
            >
              <Volume2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Statistics?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all progress and statistics for &quot;
              {kanji.character}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
