"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { VocabularyItemCard } from "../components/vocabulary-item-card";
import { VocabularyService, VocabularyWord } from "@/pwa/core/services/vocabulary";
import { useVocabularySelection } from "../store/vocabulary-selection.store";

export function VocabularyList() {
  const searchParams = useSearchParams();
  const [vocabularyList, setVocabularyList] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const setStoreVocabularyList = useVocabularySelection(state => state.setVocabularyList);

  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";

  useEffect(() => {
    if (categoryId) {
      setLoading(true);
      try {
        const category = VocabularyService.getVocabularyByCategory(parseInt(categoryId), level);
        if (category) {
          setVocabularyList(category.vocabulary);
          setStoreVocabularyList(category.vocabulary);
        } else {
          setVocabularyList([]);
          setStoreVocabularyList([]);
        }
      } catch (error) {
        console.error('Error loading vocabulary:', error);
        setVocabularyList([]);
        setStoreVocabularyList([]);
      } finally {
        setLoading(false);
      }
    }
  }, [categoryId, level, setStoreVocabularyList]);

  const handleVocabularyClick = (vocabulary: VocabularyWord) => {
    console.log(`Clicked vocabulary: ${vocabulary.kanji}`);
    // TODO: Navigate to vocabulary detail page or show modal
  };

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 flex items-center justify-center">
        <div>Loading vocabulary...</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 space-y-4">
      {vocabularyList.map((vocabulary, index) => (
        <VocabularyItemCard
          key={vocabulary.id}
          vocabulary={vocabulary}
          index={index + 1}
          onClick={handleVocabularyClick}
          level={level}
          categoryId={categoryId || ""}
        />
      ))}
    </div>
  );
}
