"use client";

import { useEffect } from "react";
import { Header } from "@/pwa/core/fragments/header";
import { LevelSection } from "../fragments/level-section";
import { CategorySection } from "../fragments/category-section";
import { FilterSection } from "../fragments/filter-section";
import { KanjiListCTA } from "../fragments/kanji-list-cta";
import { LessonTypeToggle } from "../fragments/lesson-type-toggle";
import { KanjiLessonsSection } from "../fragments/kanji-lessons-section";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import { config } from "@/pwa/core/config/env";

export function HomeContainer() {
  const { initializeUser, isInitialized } = useScoreStore();
  
  // Initialize score system on app start
  useEffect(() => {
    if (!isInitialized) {
      initializeUser(config.defaults.userId, config.defaults.level);
    }
  }, [initializeUser, isInitialized]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="px-4 py-6">
        {/* Level Section */}
        <LevelSection />

        {/* Category Section */}
        <CategorySection />

        {/* Filter Section */}
        <FilterSection />

        <div className="flex items-center justify-between">
          {/* Kanji List CTA */}
          <KanjiListCTA />
          {/* Lesson Type Toggle */}
          <LessonTypeToggle />
        </div>

        {/* Kanji Lessons Section */}
        <KanjiLessonsSection />
      </div>
    </div>
  );
}
