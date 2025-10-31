"use client";

import { useState } from "react";
import { Header } from "@/pwa/core/fragments/header";
import { LevelSection } from "../fragments/level-section";
import { CategorySection } from "../fragments/category-section";
import { FilterSection } from "../fragments/filter-section";
import { KanjiListCTA } from "../fragments/kanji-list-cta";
import { KanjiLessonsSection } from "../fragments/kanji-lessons-section";

export function HomeContainer() {
  const [selectedLevel, setSelectedLevel] = useState("N5");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="px-4 py-6">
        {/* Level Section */}
        <LevelSection onLevelChange={setSelectedLevel} />

        {/* Category Section */}
        <CategorySection />

        {/* Filter Section */}
        <FilterSection />

        {/* Kanji List CTA */}
        <KanjiListCTA selectedLevel={selectedLevel} />

        {/* Kanji Lessons Section */}
        <KanjiLessonsSection selectedLevel={selectedLevel} />
      </div>
    </div>
  );
}