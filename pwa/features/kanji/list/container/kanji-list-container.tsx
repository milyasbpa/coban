"use client";

import { HeaderSection } from "../fragments/header-section";
import { LevelFilter } from "../fragments/level-filter";
import { KanjiGridSection } from "../fragments/kanji-grid-section";

export function KanjiListContainer() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderSection />

      {/* Level Filter */}
      <div className="sticky top-[57px] z-10 py-4 bg-muted/50 backdrop-blur supports-backdrop-filter:bg-muted/30 border-b border-border">
        <LevelFilter />
      </div>

      {/* Kanji Grid */}
      <KanjiGridSection />
    </div>
  );
}