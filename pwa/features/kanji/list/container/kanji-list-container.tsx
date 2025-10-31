"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { KanjiGridCard } from "../components/kanji-grid-card";
import { LevelFilter } from "../fragments/level-filter";
import { getAllKanjiByLevel, getAvailableLevels, KanjiItem } from "../utils/kanji-list";

export function KanjiListContainer() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  
  const levels = getAvailableLevels();

  useEffect(() => {
    const kanji = getAllKanjiByLevel(selectedLevel);
    setKanjiList(kanji);
  }, [selectedLevel]);

  const handleBack = () => {
    router.back();
  };

  const handleKanjiClick = (kanji: KanjiItem) => {
    console.log(`Clicked kanji: ${kanji.character}`);
    // TODO: Navigate to kanji detail page or show modal
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      {/* Level Filter */}
      <div className="py-4 bg-muted/30 border-b border-border">
        <LevelFilter
          levels={levels}
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
        />
      </div>

      {/* Kanji Grid */}
      <div className="p-4 pb-20 bg-background min-h-screen">
        <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
          {kanjiList.map((kanji) => (
            <KanjiGridCard
              key={kanji.id}
              kanji={kanji}
              onClick={handleKanjiClick}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-lg">
        <div className="flex items-center justify-center h-full">
          <div className="flex gap-3">
            {/* Language toggle buttons using design system colors */}
            <Button 
              variant="default" 
              size="sm"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg"
            >
              Furigana
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg"
            >
              JP
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground px-4 py-2 rounded-lg"
            >
              EN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}