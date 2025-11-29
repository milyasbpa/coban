"use client";

import { LessonHeader } from "../fragments/lesson-header";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { VocabularyList } from "../fragments/vocabulary-list";
import { ScrollFloatingButton } from "@/pwa/core/components/scroll-floating-button";
import { useVocabularySelection } from "../store/vocabulary-selection.store";

export function VocabularyLessonContainer() {
  const { isSelectionMode } = useVocabularySelection();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Vocabulary List */}
      <VocabularyList />

      {/* Selection Bottom Nav */}
      {isSelectionMode && <SelectionBottomNav />}

      {/* Scroll Floating Button */}
      <ScrollFloatingButton />
    </div>
  );
}
