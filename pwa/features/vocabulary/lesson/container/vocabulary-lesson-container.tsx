"use client";

import { useEffect } from "react";
import { LessonHeader } from "../fragments/lesson-header";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { VocabularyList } from "../fragments/vocabulary-list";
import { ScrollFloatingButton } from "@/pwa/core/components/scroll-floating-button";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";

export function VocabularyLessonContainer() {
  const { isSelectionMode } = useVocabularySelection();
  const { isAuthenticated, user } = useLoginStore();
  const { initializeUser, isInitialized } = useVocabularyScoreStore();
  
  // Auto-save current page URL for restoration after restart
  useLastVisitedPage();

  // Initialize vocabulary score store when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      initializeUser(user.uid);
    }
  }, [isAuthenticated, user, isInitialized, initializeUser]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Selection Bottom Nav - Only show when in selection mode */}
      {isSelectionMode && <SelectionBottomNav />}

      {/* Vocabulary List */}
      <VocabularyList />

      {/* Scroll Floating Button */}
      <ScrollFloatingButton />
    </div>
  );
}
