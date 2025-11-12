"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KanjiCard } from "../components/kanji-card";
import { LessonHeader } from "../fragments/lesson-header";
import { LessonDisplayOptionsControl } from "../fragments/lesson-display-options-control";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { KanjiService, KanjiDetail } from "@/pwa/core/services/kanji";

export function KanjiLessonContainer() {
  const searchParams = useSearchParams();
  const [kanjiList, setKanjiList] = useState<KanjiDetail[]>([]);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const { isSelectionMode } = useKanjiSelection();

  const lessonId = searchParams.get("lessonId");
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";

  useEffect(() => {
    if (topicId) {
      // Handle topic-based lesson
      const kanji = KanjiService.getKanjiDetailsByTopicId(topicId, level);
      setKanjiList(kanji);

      // Get topic name for title
      const categories = KanjiService.getTopicCategories(level);
      const category = categories[topicId];
      if (category) {
        setLessonTitle(category.name);
      }
    } else if (lessonId) {
      // Handle stroke-based lesson
      const kanji = KanjiService.getKanjiDetailsByLessonId(
        parseInt(lessonId),
        level
      );
      setKanjiList(kanji);
      setLessonTitle(`Lesson ${lessonId}`);
    }
  }, [lessonId, topicId, level]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Kanji List */}
      <div className="px-4 pt-6 pb-24 space-y-4">
        {/* Lesson Title */}
        {lessonTitle && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {lessonTitle}
            </h1>
          </div>
        )}

        {kanjiList.map((kanji, index) => (
          <KanjiCard key={kanji.id} kanji={kanji} index={index + 1} />
        ))}
      </div>

      {/* Display Options Control */}
      <LessonDisplayOptionsControl />

      {/* Selection Bottom Navigation */}
      {isSelectionMode && <SelectionBottomNav />}
    </div>
  );
}
