"use client";

import { Button } from "@/pwa/core/components/button";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import {
  getLocalizedText,
  SupportedLanguage,
} from "../../../kanji/shared/utils/language-helpers";
import {
  Edit3,
  Book,
  Users,
  X,
  RotateCcw,
  Clock,
  CheckSquare,
  ChevronDown,
} from "lucide-react";
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
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { Slider } from "@/pwa/core/components/slider";
import { Checkbox } from "@/pwa/core/components/checkbox";
import { useTimerPreferenceStore } from "@/pwa/core/stores/timer-preference.store";
import {
  getMasteryFilterOptions,
  matchesMasteryFilter,
} from "@/pwa/core/lib/utils/mastery";

export function SelectionBottomNav() {
  const {
    selectedVocabularyIds,
    clearSelection,
    toggleSelectionMode,
    selectAll,
  } = useVocabularySelection();
  const vocabularyList = useVocabularySelection(
    (state) => state.vocabularyList
  );
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { resetVocabularyStatistics, getVocabularyAccuracy } =
    useVocabularyScoreStore();
  const { timerEnabled, timerValue, setTimerEnabled, setTimerValue } =
    useTimerPreferenceStore();

  const selectedCount = selectedVocabularyIds.size;
  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";

  // Bulk selection handlers
  const handleSelectAll = () => {
    const allIds = vocabularyList.map((v) => v.id);
    selectAll(allIds);
  };

  const handleSelectByMasteryFilter = (filterValue: string) => {
    if (filterValue === "all") {
      handleSelectAll();
      return;
    }

    const filtered = vocabularyList.filter((vocab) => {
      const accuracy = getVocabularyAccuracy(
        vocab.id.toString(),
        level,
        categoryId || ""
      );
      const accuracyValue = accuracy ?? 0; // Treat null as 0 for new items
      return matchesMasteryFilter(accuracyValue, filterValue);
    });

    selectAll(filtered.map((v) => v.id));
  };

  // Legacy handlers for backward compatibility
  const handleSelectByAccuracy = (threshold: number) => {
    const filtered = vocabularyList.filter((vocab) => {
      const accuracy = getVocabularyAccuracy(
        vocab.id.toString(),
        level,
        categoryId || ""
      );
      if (accuracy === null) return false; // Exclude new vocabulary for accuracy filter
      return accuracy < threshold;
    });
    selectAll(filtered.map((v) => v.id));
  };

  const handleSelectNewOnly = () => {
    const filtered = vocabularyList.filter((vocab) => {
      const accuracy = getVocabularyAccuracy(
        vocab.id.toString(),
        level,
        categoryId || ""
      );
      return accuracy === null; // Only new vocabulary
    });
    selectAll(filtered.map((v) => v.id));
  };

  const handleExerciseStart = (exerciseType: string) => {
    if (!categoryId || selectedVocabularyIds.size === 0) return;

    const selectedVocabularyArray = Array.from(selectedVocabularyIds);

    // Build URL with selected vocabulary parameters
    const selectedVocabularyParam = selectedVocabularyArray.join(",");

    // Build base URL
    const baseUrl = `categoryId=${categoryId}&level=${level}&selectedVocabulary=${selectedVocabularyParam}`;

    if (exerciseType === "pairing") {
      window.location.href = `/vocabulary/exercise/pairing?${baseUrl}`;
    } else if (exerciseType === "reading") {
      window.location.href = `/vocabulary/exercise/reading?${baseUrl}`;
    } else if (exerciseType === "writing") {
      window.location.href = `/vocabulary/exercise/writing?${baseUrl}`;
    }

    // Clear selection after navigation
    clearSelection();
    toggleSelectionMode();
  };

  const handleBulkReset = async () => {
    if (!categoryId) return;

    try {
      // Reset each selected vocabulary
      const selectedArray = Array.from(selectedVocabularyIds);
      for (const vocabularyId of selectedArray) {
        await resetVocabularyStatistics(
          vocabularyId.toString(),
          level,
          categoryId
        );
      }

      // Clear selection and close dialog
      clearSelection();
      setShowResetDialog(false);
    } catch (error) {
      console.error("Error resetting vocabulary statistics:", error);
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
                      {selectedCount}{" "}
                      {getLocalizedText(
                        language as SupportedLanguage,
                        "kata",
                        "vocabulary"
                      )}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={handleSelectAll}>
                    <CheckSquare className="h-3.5 w-3.5 mr-2" />
                    {getLocalizedText(
                      language as SupportedLanguage,
                      "Pilih Semua",
                      "Select All"
                    )}
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
                        onClick={() =>
                          handleSelectByMasteryFilter(option.value)
                        }
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
                  {getLocalizedText(
                    language as SupportedLanguage,
                    "Reset",
                    "Reset"
                  )}
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
            {getLocalizedText(
              language as SupportedLanguage,
              "Latihan",
              "Exercise"
            )}
          </h3>

          {/* Exercise buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Writing */}
            <Button
              variant="outline"
              onClick={() => handleExerciseStart("writing")}
              disabled={selectedCount === 0}
              className="h-9 w-full p-0 border-2 hover:bg-muted/30 transition-colors"
              title={getLocalizedText(
                language as SupportedLanguage,
                "Latihan Menulis",
                "Writing Exercise"
              )}
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
              title={getLocalizedText(
                language as SupportedLanguage,
                "Latihan Membaca",
                "Reading Exercise"
              )}
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
              title={getLocalizedText(
                language as SupportedLanguage,
                "Latihan Pasangan",
                "Pairing Exercise"
              )}
            >
              <Users className="h-4 w-4" />
              Pairing
            </Button>
          </div>

          {/* Timer settings */}
          <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/20 rounded-lg border border-border/50">
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {getLocalizedText(
                language as SupportedLanguage,
                "Timer:",
                "Timer:"
              )}
            </span>

            <Checkbox
              id="timer-enable-vocab-nav"
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
              {getLocalizedText(
                language as SupportedLanguage,
                "Reset Statistik?",
                "Reset Statistics?"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getLocalizedText(
                language as SupportedLanguage,
                `Ini akan mereset semua progress dan statistik untuk ${selectedCount} kosakata yang dipilih. Aksi ini tidak dapat dibatalkan.`,
                `This will reset all progress and statistics for ${selectedCount} selected vocabulary. This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {getLocalizedText(
                language as SupportedLanguage,
                "Batal",
                "Cancel"
              )}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkReset}
              className="bg-destructive hover:bg-destructive/90"
            >
              {getLocalizedText(
                language as SupportedLanguage,
                "Reset",
                "Reset"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
