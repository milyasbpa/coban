"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KanjiCard } from "../components/kanji-card";
import { KanjiService, KanjiDetail } from "@/pwa/core/services/kanji";

export function KanjiList() {
  const searchParams = useSearchParams();
  const [kanjiList, setKanjiList] = useState<KanjiDetail[]>([]);

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
    <div className="px-4 pt-6 pb-24 space-y-4">
      {kanjiList.map((kanji, index) => (
        <KanjiCard key={kanji.id} kanji={kanji} index={index + 1} level={level} />
      ))}
    </div>
  );
}
