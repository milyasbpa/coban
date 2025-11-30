"use client";

import { useEffect } from "react";
import { Header } from "@/pwa/features/home/fragments/header";
import { LevelSection } from "../fragments/level-section";
import { CategorySection } from "../fragments/category-section";
import { KanjiListCTA } from "../fragments/kanji-list-cta";
import { KanjiLessonTypeToggle } from "../fragments/kanji-lesson-type-toggle";
import { KanjiLessonsSection } from "../fragments/kanji-lessons-section";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { useGrammarScoreStore } from "@/pwa/features/score/store/grammar-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { useHomeSettingsStore } from "../store/home-settings.store";
import { config } from "@/pwa/core/config/env";
import { VocabularyLessonSection } from "../fragments/vocabulary-lesson-section";
import { GrammarLessonSection } from "../fragments/grammar-lesson-section";
import { ScrollFloatingButton } from "@/pwa/core/components/scroll-floating-button";

// Conditional Controls Component
function ConditionalControls() {
  const { selectedCategory } = useHomeSettingsStore();

  if (selectedCategory === "kanji") {
    return (
      <div className="flex items-center justify-between">
        {/* Kanji List CTA */}
        <KanjiListCTA />
        {/* Lesson Type Toggle */}
        <KanjiLessonTypeToggle />
      </div>
    );
  }

  if (selectedCategory === "vocabulary") {
    return (
      <div className="flex items-center justify-between">
        {/* Vocabulary List CTA - placeholder for now */}
        <div></div>
        {/* No lesson type toggle for vocabulary */}
        <div></div>
      </div>
    );
  }

  // For other categories (grammar, listening) - no controls yet
  return null;
}

export function HomeContainer() {
  const { selectedCategory } = useHomeSettingsStore();
  const { isAuthenticated, user } = useLoginStore();

  const {
    initializeUser: initializeKanjiUser,
    isInitialized: isKanjiInitialized,
  } = useKanjiScoreStore();
  const { initializeUser: initializeVocabularyUser } =
    useVocabularyScoreStore();
  const { initializeUser: initializeGrammarUser } = useGrammarScoreStore();

  // Initialize score systems only for authenticated users
  useEffect(() => {
    // Only initialize if user is authenticated
    if (isAuthenticated && user && !isKanjiInitialized) {
      initializeKanjiUser(user.uid, config.defaults.level);
      initializeVocabularyUser(user.uid, config.defaults.level);
      initializeGrammarUser(user.uid, config.defaults.level);
    }
  }, [
    isAuthenticated,
    user,
    initializeKanjiUser,
    initializeVocabularyUser,
    initializeGrammarUser,
    isKanjiInitialized,
  ]);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <Header />

      <div className="px-4 py-6">
        {/* Level Section */}
        <LevelSection />

        {/* Category Section */}
        <CategorySection />

        {/* Conditional Controls based on selected category */}
        <ConditionalControls />

        {/* Kanji Lessons Section */}
        {selectedCategory === "vocabulary" ? (
          <VocabularyLessonSection showProgress={isAuthenticated} />
        ) : selectedCategory === "kanji" ? (
          <KanjiLessonsSection showProgress={isAuthenticated} />
        ) : selectedCategory === "grammar" ? (
          <GrammarLessonSection showProgress={isAuthenticated} />
        ) : null}
      </div>
      <ScrollFloatingButton />
    </div>
  );
}
