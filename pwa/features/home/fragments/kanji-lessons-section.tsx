"use client";

import { useHomeSettingsStore } from "../store/home-settings.store";
import { KanjiStrokeLessonsSection } from "./kanji-stroke-lessons-section";
import { KanjiTopicLessonsSection } from "./kanji-topic-lessons-section";

interface KanjiLessonsSectionProps {
  showProgress?: boolean;
}

/**
 * Main switcher component for lessons
 * Renders appropriate lesson section based on selected category and lesson type
 * No props needed - uses internal stores for state management
 */
export function KanjiLessonsSection({ showProgress = false }: KanjiLessonsSectionProps) {
  const { selectedLessonType } = useHomeSettingsStore();

  // For kanji category, use lesson type switcher
  if (selectedLessonType === "topic") {
    return <KanjiTopicLessonsSection showProgress={showProgress} />;
  }

  // Default to stroke lessons for kanji
  return <KanjiStrokeLessonsSection showProgress={showProgress} />;
}
