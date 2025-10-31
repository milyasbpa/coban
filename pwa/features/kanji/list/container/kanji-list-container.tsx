"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { KanjiCard } from "../components/kanji-card";
import { FilterSection } from "../fragments/filter-section";
import { getKanjiDetailsByLessonId, KanjiDetail } from "../utils/kanji";

export function KanjiListContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [kanjiList, setKanjiList] = useState<KanjiDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  
  const lessonId = searchParams.get('lessonId');
  const level = searchParams.get('level') || 'N5';
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil(kanjiList.length / itemsPerPage);
  
  useEffect(() => {
    if (lessonId) {
      const kanji = getKanjiDetailsByLessonId(parseInt(lessonId), level);
      setKanjiList(kanji);
    }
  }, [lessonId, level]);

  const handleBack = () => {
    router.back();
  };

  const handleFavoriteToggle = (kanjiId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(kanjiId)) {
        newFavorites.delete(kanjiId);
      } else {
        newFavorites.add(kanjiId);
      }
      return newFavorites;
    });
  };

  const paginatedKanji = kanjiList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-blue-500">Back</span>
        </Button>
      </div>

      {/* Filter Section */}
      <FilterSection
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Kanji List */}
      <div className="px-4 pb-20 space-y-4">
        {paginatedKanji.map((kanji, index) => (
          <KanjiCard
            key={kanji.id}
            kanji={kanji}
            index={(currentPage - 1) * itemsPerPage + index + 1}
            onFavoriteToggle={handleFavoriteToggle}
            isFavorite={favorites.has(kanji.id)}
          />
        ))}
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border">
        <div className="flex items-center justify-center h-full">
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}