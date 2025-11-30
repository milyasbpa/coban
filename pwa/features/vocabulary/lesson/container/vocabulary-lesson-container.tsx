"use client";

import { LessonHeader } from "../fragments/lesson-header";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { VocabularyList } from "../fragments/vocabulary-list";
import { ScrollFloatingButton } from "@/pwa/core/components/scroll-floating-button";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";

export function VocabularyLessonContainer() {
  const { isSelectionMode } = useVocabularySelection();
  
  // Auto-save current page URL for restoration after restart
  useLastVisitedPage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Selection Bottom Nav - Only show when in selection mode */}
      {isSelectionMode && <SelectionBottomNav />}

      {/* Vocabulary List */}
      <VocabularyList />

      {/* Scroll Floating Button */}
      <ScrollFloatingButton />
    </div>
  );
}
