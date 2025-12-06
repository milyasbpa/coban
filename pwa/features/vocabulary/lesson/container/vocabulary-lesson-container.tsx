"use client";

import { useEffect } from "react";
import { LessonHeader } from "../fragments/lesson-header";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { VocabularyList } from "../fragments/vocabulary-list";
import { ScrollFloatingButton } from "@/pwa/core/components/scroll-floating-button";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { useScrollRestoration } from "@/pwa/core/lib/hooks/use-scroll-restoration";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { useSearchParams } from "next/navigation";

export function VocabularyLessonContainer() {
  const { isSelectionMode, initializeSelectionMode } = useVocabularySelection();
  const { isAuthenticated, user } = useLoginStore();
  const { initializeUser, isInitialized } = useVocabularyScoreStore();
  const searchParams = useSearchParams();
  
  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";
  
  // Auto-save current page URL for restoration after restart
  useLastVisitedPage();

  // Auto-save and restore scroll position
  useScrollRestoration(`vocabulary-scroll-${categoryId}-${level}`);

  // Initialize selection mode from localStorage on mount
  useEffect(() => {
    initializeSelectionMode();
  }, [initializeSelectionMode]);

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

      {/* Selection Bottom Nav - Sticky below header with slide animation */}
      <div
        className={`sticky top-14 z-40 overflow-hidden transition-all duration-500 ease-in-out ${
          isSelectionMode
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <SelectionBottomNav />
      </div>

      {/* Vocabulary List */}
      <VocabularyList />

      {/* Scroll Floating Button */}
      <ScrollFloatingButton />
    </div>
  );
}
