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
  const { isSelectionMode } = useKanjiSelection();
  const { isAuthenticated, user } = useLoginStore();
  const { initializeUser, isInitialized } = useKanjiScoreStore();
  
  // Auto-save current page URL for restoration after restart
  useLastVisitedPage();

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

      {/* Selection Bottom Navigation - Only show when in selection mode */}
      {isSelectionMode && <SelectionBottomNav />}

      {/* Kanji List */}
      <KanjiList />

      {/* Scroll Floating Button */}
      <ScrollFloatingButton />
    </div>
  );
}
