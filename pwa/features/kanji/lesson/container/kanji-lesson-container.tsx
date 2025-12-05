"use client";

import { useEffect } from "react";
import { LessonHeader } from "../fragments/lesson-header";
import { KanjiList } from "../fragments/kanji-list";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { ScrollFloatingButton } from "@/pwa/core/components/scroll-floating-button";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { useLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";

export function KanjiLessonContainer() {
  const { isSelectionMode, initializeSelectionMode } = useKanjiSelection();
  const { isAuthenticated, user } = useLoginStore();
  const { initializeUser, isInitialized } = useKanjiScoreStore();
  
  // Auto-save current page URL for restoration after restart
  useLastVisitedPage();

  // Initialize selection mode from localStorage on mount
  useEffect(() => {
    initializeSelectionMode();
  }, [initializeSelectionMode]);

  // Initialize kanji score store when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      initializeUser(user.uid);
    }
  }, [isAuthenticated, user, isInitialized, initializeUser]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Selection Bottom Navigation - Sticky below header with slide animation */}
      <div
        className={`sticky top-14 z-40 overflow-hidden transition-all duration-500 ease-in-out ${
          isSelectionMode
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <SelectionBottomNav />
      </div>

      {/* Kanji List */}
      <KanjiList />

      {/* Scroll Floating Button */}
      <ScrollFloatingButton />
    </div>
  );
}
