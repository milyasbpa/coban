"use client";

import { KanjiStrokeLessonsSection } from "./kanji-stroke-lessons-section";

interface KanjiLessonsSectionProps {
  showProgress?: boolean;
}

/**
 * Main component for kanji lessons
 * Renders stroke-based lesson section
 */
export function KanjiLessonsSection({ showProgress = false }: KanjiLessonsSectionProps) {
  // Only stroke lessons available for kanji
  return <KanjiStrokeLessonsSection showProgress={showProgress} />;
}
