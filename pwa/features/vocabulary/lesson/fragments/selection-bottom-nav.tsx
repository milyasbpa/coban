"use client";

import { Button } from "@/pwa/core/components/button";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { getLocalizedText, SupportedLanguage } from "../../../kanji/shared/utils/language-helpers";
import { Edit3, Book, Users, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function SelectionBottomNav() {
  const { selectedVocabularyIds, clearSelection, toggleSelectionMode } =
    useVocabularySelection();
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const selectedCount = selectedVocabularyIds.size;
  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";

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

  return (
    <div className="sticky top-14 z-40 bg-popover/95 backdrop-blur supports-backdrop-filter:bg-popover/90 border-b-2 border-border shadow-lg">
      <div className="p-4 space-y-3">
        {/* Header with selected count and close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-foreground text-background px-3 py-1 rounded-full">
              <span className="text-xs font-bold tracking-wider">
                {selectedCount} {getLocalizedText(language as SupportedLanguage, "TERPILIH", "SELECTED")}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearSelection();
              toggleSelectionMode();
            }}
            className="h-8 w-8 p-0 rounded-full hover:bg-muted/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Exercise buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* Writing Exercise */}
          <Button
            variant="outline"
            onClick={() => handleExerciseStart("writing")}
            className="bg-card border-2 border-border hover:bg-muted/30 transition-colors shadow-sm p-3 h-auto flex-col gap-1"
          >
            <Edit3 className="h-4 w-4 text-foreground" />
            <span className="text-xs font-medium text-foreground">
              {getLocalizedText(language as SupportedLanguage, "Menulis", "Writing")}
            </span>
          </Button>

          {/* Reading Exercise */}
          <Button
            variant="outline"
            onClick={() => handleExerciseStart("reading")}
            className="bg-card border-2 border-border hover:bg-muted/30 transition-colors shadow-sm p-3 h-auto flex-col gap-1"
          >
            <Book className="h-4 w-4 text-foreground" />
            <span className="text-xs font-medium text-foreground">
              {getLocalizedText(language as SupportedLanguage, "Membaca", "Reading")}
            </span>
          </Button>

          {/* Pairing Exercise */}
          <Button
            variant="outline"
            onClick={() => handleExerciseStart("pairing")}
            className="bg-card border-2 border-border hover:bg-muted/30 transition-colors shadow-sm p-3 h-auto flex-col gap-1"
          >
            <Users className="h-4 w-4 text-foreground" />
            <span className="text-xs font-medium text-foreground">
              {getLocalizedText(language as SupportedLanguage, "Pasangan", "Pairing")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
