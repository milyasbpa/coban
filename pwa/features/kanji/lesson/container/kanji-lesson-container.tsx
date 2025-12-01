"use client";

import { LessonHeader } from "../fragments/lesson-header";
import { KanjiList } from "../fragments/kanji-list";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { ScrollFloatingButton } from "@/pwa/core/components/scroll-floating-button";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { useLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";

export function KanjiLessonContainer() {
  const { isSelectionMode } = useKanjiSelection();
  
  // Auto-save current page URL for restoration after restart
  useLastVisitedPage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Selection Bottom Navigation - Only show when in selection mode */}
      {isSelectionMode && <SelectionBottomNav />}

      {/* Kanji List */}
      <KanjiList />

      {/* Scroll Floating Button */}
      <ScrollFloatingButton />
    </div>
  );
}
