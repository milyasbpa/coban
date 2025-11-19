"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { VocabularyItemCard } from "../components/vocabulary-item-card";
import { LessonHeader } from "../fragments/lesson-header";
import { LessonDisplayOptionsControl } from "../fragments/lesson-display-options-control";
import { SelectionBottomNav } from "../fragments/selection-bottom-nav";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { VocabularyService, VocabularyWord } from "@/pwa/core/services/vocabulary";

export function VocabularyLessonContainer() {
  const searchParams = useSearchParams();
  const [vocabularyList, setVocabularyList] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSelectionMode } = useVocabularySelection();

  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";

  useEffect(() => {
    if (categoryId) {
      setLoading(true);
      try {
        const category = VocabularyService.getVocabularyByCategory(parseInt(categoryId), level);
        if (category) {
          setVocabularyList(category.vocabulary);
        } else {
          setVocabularyList([]);
        }
      } catch (error) {
        console.error('Error loading vocabulary:', error);
        setVocabularyList([]);
      } finally {
        setLoading(false);
      }
    }
  }, [categoryId, level]);

  const handleVocabularyClick = (vocabulary: VocabularyWord) => {
    console.log(`Clicked vocabulary: ${vocabulary.kanji}`);
    // TODO: Navigate to vocabulary detail page or show modal
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading vocabulary...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LessonHeader />

      {/* Vocabulary List */}
      <div className="px-4 pt-6 pb-24 space-y-4">
        {vocabularyList.map((vocabulary, index) => (
          <VocabularyItemCard
            key={vocabulary.id}
            vocabulary={vocabulary}
            index={index + 1}
            onClick={handleVocabularyClick}
          />
        ))}
      </div>

      {/* Display Options Control */}
      <LessonDisplayOptionsControl />

      {/* Selection Bottom Nav */}
      {isSelectionMode && <SelectionBottomNav />}
    </div>
  );
}