"use client";

import { Button } from "@/pwa/core/components/button";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { Edit3, Book, Users, X } from "lucide-react";
import { cn } from "@/pwa/core/lib/utils";
import { useSearchParams } from "next/navigation";

export function SelectionBottomNav() {
  const { selectedKanjiIds, clearSelection, toggleSelectionMode } =
    useKanjiSelection();
  const { isIndonesian } = useLanguage();
  const searchParams = useSearchParams();

  const selectedCount = selectedKanjiIds.size;
  const lessonId = searchParams.get("lessonId");
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";

  if (selectedCount === 0) return null;

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-popover/95 backdrop-blur supports-backdrop-filter:bg-popover/90 border-t-2 border-border shadow-xl">
      <div className="p-4 space-y-3">
        {/* Header with selected count and close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-foreground text-background px-3 py-1 rounded-full">
              <span className="text-xs font-bold tracking-wider">
                {selectedCount} {isIndonesian ? "TERPILIH" : "SELECTED"}
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
              {isIndonesian ? "Menulis" : "Writing"}
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
              {isIndonesian ? "Membaca" : "Reading"}
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
              {isIndonesian ? "Pasangan" : "Pairing"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
