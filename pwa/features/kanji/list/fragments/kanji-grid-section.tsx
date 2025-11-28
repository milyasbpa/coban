"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KanjiGridCard } from "../components/kanji-grid-card";
import { getAllKanjiByLevel, KanjiItem } from "../utils/kanji-list";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";

export function KanjiGridSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedLevel = searchParams.get('level') || 'N5';
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  
  // Get auth state and score functions
  const { user } = useLoginStore();
  const { getKanjiAccuracy, initializeUser, isInitialized } = useKanjiScoreStore();

  useEffect(() => {
    const kanji = getAllKanjiByLevel(selectedLevel);
    setKanjiList(kanji);
  }, [selectedLevel]);

  // Initialize user score if authenticated
  useEffect(() => {
    if (user && !isInitialized) {
      initializeUser(user.uid, selectedLevel as "N5" | "N4" | "N3" | "N2" | "N1");
    }
  }, [user, isInitialized, selectedLevel, initializeUser]);

  const handleKanjiClick = (kanji: KanjiItem) => {
    // Navigate to kanji character detail page with id and level
    router.push(`/kanji/character?id=${kanji.id}&level=${selectedLevel}`);
  };

  return (
    <div className="p-4 pb-8 bg-background min-h-[calc(100vh-130px)]">
      <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
        {kanjiList.length > 0 ? (
          kanjiList.map((kanji) => {
            // Get accuracy for this kanji if user is authenticated
            const accuracy = user ? getKanjiAccuracy(kanji.id.toString()) : null;
            
            return (
              <KanjiGridCard
                key={`${kanji.level}-${kanji.id}`}
                kanji={kanji}
                onClick={handleKanjiClick}
                accuracy={accuracy}
              />
            );
          })
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
