"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KanjiCard } from "../components/kanji-card";
import { LessonHeader } from "../fragments/lesson-header";
import { DisplayOptionsControl } from "../fragments/display-options-control";
import { getKanjiDetailsByLessonId, KanjiDetail } from "../utils/kanji";

export function KanjiLessonContainer() {
  const searchParams = useSearchParams();
  const [kanjiList, setKanjiList] = useState<KanjiDetail[]>([]);

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  useEffect(() => {
    if (lessonId) {
      const kanji = getKanjiDetailsByLessonId(parseInt(lessonId), level);
      setKanjiList(kanji);
    }
  }, [lessonId, level]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Kanji List */}
      <div className="px-4 pt-6 pb-24 space-y-4">
        {kanjiList.map((kanji, index) => (
          <KanjiCard
            key={kanji.id}
            kanji={kanji}
            index={index + 1}
          />
        ))}
      </div>

      {/* Display Options Control */}
      <DisplayOptionsControl />
    </div>
  );
}
