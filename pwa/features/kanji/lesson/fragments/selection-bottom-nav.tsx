"use client";

import { Button } from "@/pwa/core/components/button";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import {
  getLocalizedText,
  SupportedLanguage,
} from "../../shared/utils/language-helpers";
import { Edit3, Book, Users, X, RotateCcw, Clock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
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
import { Slider } from "@/pwa/core/components/slider";
import { Checkbox } from "@/pwa/core/components/checkbox";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";

export function SelectionBottomNav() {
  const { selectedKanjiIds, clearSelection, toggleSelectionMode } =
    useKanjiSelection();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { resetKanjiStatistics } = useKanjiScoreStore();
  const { timerEnabled, timerValue, setTimerEnabled, setTimerValue } = useTimerPreferenceStore();

  const selectedCount = selectedKanjiIds.size;
  const lessonId = searchParams.get("lessonId");
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";

  const handleExerciseStart = (exerciseType: string) => {
    if ((!lessonId && !topicId) || selectedKanjiIds.size === 0) return;

    const selectedKanjiArray = Array.from(selectedKanjiIds);

    // Build URL with selected kanji parameters
    const selectedKanjiParam = selectedKanjiArray.join(",");

    // Build base URL with either lessonId or topicId
    let baseUrl = "";
    if (topicId) {
      baseUrl = `topicId=${topicId}&level=${level}&selectedKanji=${selectedKanjiParam}`;
    } else if (lessonId) {
      baseUrl = `lessonId=${lessonId}&level=${level}&selectedKanji=${selectedKanjiParam}`;
    }

    if (exerciseType === "pairing") {
      window.location.href = `/kanji/exercise/pairing?${baseUrl}`;
    } else if (exerciseType === "reading") {
      window.location.href = `/kanji/exercise/reading?${baseUrl}`;
    } else if (exerciseType === "writing") {
      window.location.href = `/kanji/exercise/writing?${baseUrl}`;
    }

    // Clear selection after navigation
    clearSelection();
    toggleSelectionMode();
  };

  const handleBulkReset = async () => {
    try {
      // Reset each selected kanji
      const selectedArray = Array.from(selectedKanjiIds);
      for (const kanjiId of selectedArray) {
        await resetKanjiStatistics(kanjiId.toString(), level);
      }
      
      // Clear selection and close dialog
      clearSelection();
      setShowResetDialog(false);
    } catch (error) {
      console.error("Error resetting kanji statistics:", error);
    }
  };

  return (
    <div className="sticky top-14 z-40 bg-popover/95 backdrop-blur supports-backdrop-filter:bg-popover/90 border-b-2 border-border shadow-lg">
      {/* COMPACT DESIGN: Reduced padding p-4 → p-2.5 */}
      <div className="p-2.5 space-y-2">
        {/* COMPACT HEADER ROW */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Compact count badge */}
            <div className="bg-foreground text-background px-2 py-0.5 rounded-full">
              <span className="text-[10px] font-bold tabular-nums">
                {selectedCount}
              </span>
            </div>
            
            {/* Icon-only Reset button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              disabled={selectedCount === 0}
              className="h-7 w-7 p-0 rounded-full hover:bg-destructive/10 text-destructive disabled:opacity-50"
              title={getLocalizedText(language as SupportedLanguage, "Reset Statistik", "Reset Statistics")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearSelection();
              toggleSelectionMode();
            }}
            className="h-7 w-7 p-0 rounded-full hover:bg-muted/30"
            title={getLocalizedText(language as SupportedLanguage, "Tutup", "Close")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* TIMER ROW (NEW) */}
        <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/30 rounded-lg">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          
          <Checkbox
            id="timer-enable-kanji-nav"
            checked={timerEnabled}
            onCheckedChange={(checked) => setTimerEnabled(checked === true)}
            className="h-3.5 w-3.5"
          />
          
          <div className="flex-1 flex items-center gap-2">
            <Slider
              value={[timerValue]}
              onValueChange={(values) => setTimerValue(values[0])}
              min={10}
              max={60}
              step={5}
              disabled={!timerEnabled}
              className="flex-1"
            />
            <span className="text-xs font-bold text-foreground tabular-nums w-7 text-right">
              {timerEnabled ? `${timerValue}s` : "∞"}
            </span>
          </div>
        </div>

        {/* COMPACT EXERCISE BUTTONS (Icon-only, horizontal) */}
        <div className="flex items-center justify-center gap-3">
          {/* Writing */}
          <Button
            variant="outline"
            onClick={() => handleExerciseStart("writing")}
            disabled={selectedCount === 0}
            className="h-9 w-9 p-0 border-2 hover:bg-muted/30 transition-colors"
            title={getLocalizedText(language as SupportedLanguage, "Latihan Menulis", "Writing Exercise")}
          >
            <Edit3 className="h-4 w-4" />
          </Button>

          {/* Reading */}
          <Button
            variant="outline"
            onClick={() => handleExerciseStart("reading")}
            disabled={selectedCount === 0}
            className="h-9 w-9 p-0 border-2 hover:bg-muted/30 transition-colors"
            title={getLocalizedText(language as SupportedLanguage, "Latihan Membaca", "Reading Exercise")}
          >
            <Book className="h-4 w-4" />
          </Button>

          {/* Pairing */}
          <Button
            variant="outline"
            onClick={() => handleExerciseStart("pairing")}
            disabled={selectedCount === 0}
            className="h-9 w-9 p-0 border-2 hover:bg-muted/30 transition-colors"
            title={getLocalizedText(language as SupportedLanguage, "Latihan Pasangan", "Pairing Exercise")}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getLocalizedText(language as SupportedLanguage, "Reset Statistik?", "Reset Statistics?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getLocalizedText(
                language as SupportedLanguage,
                `Ini akan mereset semua progress dan statistik untuk ${selectedCount} kanji yang dipilih. Aksi ini tidak dapat dibatalkan.`,
                `This will reset all progress and statistics for ${selectedCount} selected kanji. This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {getLocalizedText(language as SupportedLanguage, "Batal", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkReset} className="bg-destructive hover:bg-destructive/90">
              {getLocalizedText(language as SupportedLanguage, "Reset", "Reset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
