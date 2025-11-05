"use client";

import { useHomeSettingsStore } from "../store/home-settings.store";
import { KanjiStrokeLessonsSection } from "./kanji-stroke-lessons-section";
import { KanjiTopicLessonsSection } from "./kanji-topic-lessons-section";

/**
 * Main switcher component for kanji lessons
 * Renders appropriate lesson section based on selected lesson type
 * No props needed - uses internal stores for state management
 */
export function KanjiLessonsSection() {
  const { selectedLessonType } = useHomeSettingsStore();
  // Simple switcher - no complex logic, just renders appropriate component
  if (selectedLessonType === "topic") {
    return <KanjiTopicLessonsSection />;
  }

  // Default to stroke lessons
  return <KanjiStrokeLessonsSection />;
}
