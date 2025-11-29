"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KanjiCard } from "../components/kanji-card";
import { LessonHeader } from "../fragments/lesson-header";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { ScrollFloatingButton } from "@/pwa/core/components/scroll-floating-button";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { KanjiService, KanjiDetail } from "@/pwa/core/services/kanji";

export function KanjiLessonContainer() {
  const searchParams = useSearchParams();
  const [kanjiList, setKanjiList] = useState<KanjiDetail[]>([]);
  const { isSelectionMode } = useKanjiSelection();

  const lessonId = searchParams.get("lessonId");
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";

  useEffect(() => {
    if (topicId) {
      // Handle topic-based lesson
      const kanji = KanjiService.getKanjiDetailsByTopicId(topicId, level);
      setKanjiList(kanji);
    } else if (lessonId) {
      // Handle stroke-based lesson
      const kanji = KanjiService.getKanjiDetailsByLessonId(
        parseInt(lessonId),
        level
      );
      setKanjiList(kanji);
    }
  }, [lessonId, topicId, level]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Kanji List */}
      <div className="px-4 pt-6 pb-24 space-y-4">
        {kanjiList.map((kanji, index) => (
          <KanjiCard key={kanji.id} kanji={kanji} index={index + 1} />
        ))}
      </div>

      {/* Selection Bottom Navigation */}
      {isSelectionMode && <SelectionBottomNav />}

      {/* Scroll Floating Button */}
      <ScrollFloatingButton />
    </div>
  );
}
