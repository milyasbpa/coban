"use client";

import { LessonHeader } from "../fragments/lesson-header";
import { LessonDisplayOptionsControl } from "../fragments/lesson-display-options-control";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { VocabularyList } from "../fragments/vocabulary-list";
import { useVocabularySelection } from "../store/vocabulary-selection.store";

export function VocabularyLessonContainer() {
  const { isSelectionMode } = useVocabularySelection();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Vocabulary List */}
      <VocabularyList />

      {/* Display Options Control */}
      <LessonDisplayOptionsControl />

      {/* Selection Bottom Nav */}
      {isSelectionMode && <SelectionBottomNav />}
    </div>
  );
}