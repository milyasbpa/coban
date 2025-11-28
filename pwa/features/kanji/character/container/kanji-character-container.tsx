"use client";

import { HeaderSection } from "../fragments/header-section";
import { CharacterDisplaySection } from "../fragments/character-display-section";
import { PracticeStatsSection } from "../fragments/practice-stats-section";
import { WordsListSection } from "../fragments/words-list-section";
import { StrokeOrderSection } from "../fragments/stroke-order-section";

/**
 * Kanji Character Detail Container
 * Layout-only container with no props - all fragments are self-contained
 */
export function KanjiCharacterContainer() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSection />
      <CharacterDisplaySection />
      <PracticeStatsSection />
      <WordsListSection />
      <StrokeOrderSection />
    </div>
  );
}
