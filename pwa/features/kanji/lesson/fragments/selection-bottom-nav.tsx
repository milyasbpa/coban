"use client";

import { Button } from "@/pwa/core/components/button";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import {
  getLocalizedText,
  SupportedLanguage,
} from "../../shared/utils/language-helpers";
import { Edit3, Book, Users, X, RotateCcw, Clock, CheckSquare, ChevronDown } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/pwa/core/components/dropdown-menu";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { Slider } from "@/pwa/core/components/slider";
import { Checkbox } from "@/pwa/core/components/checkbox";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";
import {
  getMasteryFilterOptions,
  matchesMasteryFilter,
} from "@/pwa/core/lib/utils/mastery";

export function SelectionBottomNav() {
  const { selectedKanjiIds, clearSelection, toggleSelectionMode, selectAll } =
    useKanjiSelection();
  const kanjiList = useKanjiSelection(state => state.kanjiList);
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { resetKanjiStatistics, getKanjiAccuracy } = useKanjiScoreStore();
  const { timerEnabled, timerValue, setTimerEnabled, setTimerValue } = useTimerPreferenceStore();

  const selectedCount = selectedKanjiIds.size;
  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  // Bulk selection handlers
  const handleSelectAll = () => {
    const allIds = kanjiList.map(k => k.id);
    selectAll(allIds);
  };

  const handleSelectByMasteryFilter = (filterValue: string) => {
    if (filterValue === "all") {
      handleSelectAll();
      return;
    }

    const filtered = kanjiList.filter((kanji) => {
      const accuracy = getKanjiAccuracy(kanji.id.toString(), level);
      const accuracyValue = accuracy ?? 0; // Treat null as 0 for new items
      return matchesMasteryFilter(accuracyValue, filterValue);
    });

    selectAll(filtered.map((k) => k.id));
  };

  // Legacy handlers for backward compatibility
  const handleSelectByAccuracy = (threshold: number) => {
    const filtered = kanjiList.filter((kanji) => {
      const accuracy = getKanjiAccuracy(kanji.id.toString(), level);
      if (accuracy === null) return false; // Exclude new kanji for accuracy filter
      return accuracy < threshold;
    });
    selectAll(filtered.map(k => k.id));
  };

  const handleSelectNewOnly = () => {
    const filtered = kanjiList.filter((kanji) => {
      const accuracy = getKanjiAccuracy(kanji.id.toString(), level);
      return accuracy === null; // Only new kanji
    });
    selectAll(filtered.map(k => k.id));
  };

  const handleExerciseStart = (exerciseType: string) => {
    if (!lessonId || selectedKanjiIds.size === 0) return;

    const selectedKanjiArray = Array.from(selectedKanjiIds);

    // Build URL with selected kanji parameters
    const selectedKanjiParam = selectedKanjiArray.join(",");

    // Build base URL with lessonId
    const baseUrl = `lessonId=${lessonId}&level=${level}&selectedKanji=${selectedKanjiParam}`;

    if (exerciseType === "pairing") {
      window.location.href = `/kanji/exercise/pairing?${baseUrl}`;
    } else if (exerciseType === "reading") {
      window.location.href = `/kanji/exercise/reading?${baseUrl}`;
    } else if (exerciseType === "writing") {
      window.location.href = `/kanji/exercise/writing?${baseUrl}`;
    }

    // Clear selection after navigation (but keep selection mode active)
    clearSelection();
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
      <div className="p-3 space-y-3">
        {/* OPTIONS SECTION */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {getLocalizedText(language as SupportedLanguage, "Opsi", "Options")}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Dropdown with count */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 gap-1.5"
                  >
                    <span className="text-xs font-medium tabular-nums">
                      {selectedCount} {getLocalizedText(language as SupportedLanguage, "kanji", "kanji")}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={handleSelectAll}>
                    <CheckSquare className="h-3.5 w-3.5 mr-2" />
                    {getLocalizedText(language as SupportedLanguage, "Pilih Semua", "Select All")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Mastery level filters */}
                  {getMasteryFilterOptions()
                    .filter(
                      (opt) =>
                        opt.value !== "all" &&
                        opt.value !== "below-50" &&
                        opt.value !== "below-80"
                    )
                    .map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleSelectByMasteryFilter(option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Reset button with label */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                disabled={selectedCount === 0}
                className="h-8 px-3 gap-1.5 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:border-orange-300 dark:hover:border-orange-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {getLocalizedText(language as SupportedLanguage, "Reset", "Reset")}
                </span>
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
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-border" />

        {/* EXERCISE SECTION */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {getLocalizedText(language as SupportedLanguage, "Latihan", "Exercise")}
          </h3>
          
          {/* Exercise buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Writing */}
            <Button
              variant="outline"
              onClick={() => handleExerciseStart("writing")}
              disabled={selectedCount === 0}
              className="h-9 w-full p-0 border-2 hover:bg-muted/30 transition-colors"
              title={getLocalizedText(language as SupportedLanguage, "Latihan Menulis", "Writing Exercise")}
            >
              <Edit3 className="h-4 w-4" />
              Writing
            </Button>

            {/* Reading */}
            <Button
              variant="outline"
              onClick={() => handleExerciseStart("reading")}
              disabled={selectedCount === 0}
              className="h-9 w-full p-0 border-2 hover:bg-muted/30 transition-colors"
              title={getLocalizedText(language as SupportedLanguage, "Latihan Membaca", "Reading Exercise")}
            >
              <Book className="h-4 w-4" />
              Reading
            </Button>

            {/* Pairing */}
            <Button
              variant="outline"
              onClick={() => handleExerciseStart("pairing")}
              disabled={selectedCount === 0}
              className="h-9 w-full p-0 border-2 hover:bg-muted/30 transition-colors"
              title={getLocalizedText(language as SupportedLanguage, "Latihan Pasangan", "Pairing Exercise")}
            >
              <Users className="h-4 w-4" />
              Pairing
            </Button>
          </div>
          
          {/* Timer settings */}
          <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/20 rounded-lg border border-border/50">
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {getLocalizedText(language as SupportedLanguage, "Timer:", "Timer:")}
            </span>
            
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
              <span className="text-xs font-bold text-foreground tabular-nums w-8 text-right">
                {timerEnabled ? `${timerValue}s` : "∞"}
              </span>
            </div>
          </div>
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
