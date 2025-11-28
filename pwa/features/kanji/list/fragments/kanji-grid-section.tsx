"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KanjiGridCard } from "../components/kanji-grid-card";
import { getAllKanjiByLevel, KanjiItem } from "../utils/kanji-list";

export function KanjiGridSection() {
  const searchParams = useSearchParams();
  const selectedLevel = searchParams.get('level') || 'N5';
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);

  useEffect(() => {
    const kanji = getAllKanjiByLevel(selectedLevel);
    setKanjiList(kanji);
  }, [selectedLevel]);

  const handleKanjiClick = (kanji: KanjiItem) => {
    console.log(`Clicked kanji: ${kanji.character}`);
    // TODO: Navigate to kanji detail page or show modal
  };

  return (
    <div className="p-4 pb-8 bg-background min-h-[calc(100vh-130px)]">
      <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
        {kanjiList.length > 0 ? (
          kanjiList.map((kanji) => (
            <KanjiGridCard
              key={`${kanji.level}-${kanji.id}`}
              kanji={kanji}
              onClick={handleKanjiClick}
            />
          ))
        ) : (
          <div className="col-span-5 text-center py-12">
            <p className="text-muted-foreground text-sm">
              No kanji data available for {selectedLevel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
