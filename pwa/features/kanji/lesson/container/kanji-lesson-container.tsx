"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KanjiCard } from "../components/kanji-card";
import { LessonHeader } from "../fragments/lesson-header";
import { getKanjiDetailsByLessonId, KanjiDetail } from "../utils/kanji";

export function KanjiLessonContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [kanjiList, setKanjiList] = useState<KanjiDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";

  const itemsPerPage = 5;
  const totalPages = Math.ceil(kanjiList.length / itemsPerPage);

  useEffect(() => {
    if (lessonId) {
      const kanji = getKanjiDetailsByLessonId(parseInt(lessonId), level);
      setKanjiList(kanji);
    }
  }, [lessonId, level]);

  const paginatedKanji = kanjiList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Kanji List */}
      <div className="px-4 pb-20 space-y-4">
        {paginatedKanji.map((kanji, index) => (
          <KanjiCard
            key={kanji.id}
            kanji={kanji}
            index={(currentPage - 1) * itemsPerPage + index + 1}
          />
        ))}
      </div>
    </div>
  );
}
