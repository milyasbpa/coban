"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { VocabularyPairingSectionProgress } from "../fragments/vocabulary-pairing-section-progress";
import { VocabularyPairingGrid } from "../fragments/vocabulary-pairing-grid";
import { ResultCard } from "../../reading/fragments/result-card"; // Reuse from reading
import { VocabularyService } from "@/pwa/core/services/vocabulary";

interface VocabularyPairingExerciseContainerProps {
  level: string;
  categoryId: string;
}

export const VocabularyPairingExerciseContainer: React.FC<
  VocabularyPairingExerciseContainerProps
> = ({ level, categoryId }) => {
  const router = useRouter();
  const store = useVocabularyPairingExerciseStore();

  useEffect(() => {
    initializeExercise();
  }, [level, categoryId]);

  const initializeExercise = async () => {
    try {
      // Get vocabulary category
      const vocabularyCategory =
        VocabularyService.getVocabularyByCategoryString(categoryId, level);
        console.log(vocabularyCategory,'ini apa')
      if (!vocabularyCategory) {
        console.error("Not enough vocabulary words for exercise");
        return;
      }

      // Initialize the game with vocabulary words
      store.initializeGame(vocabularyCategory.vocabulary);
    } catch (error) {
      console.error("Failed to initialize vocabulary pairing exercise:", error);
    }
  };

  const handleCardClick = (card: any) => {
    // Prevent selection if 2 cards already selected
    if (store.sectionState.selectedCards.length >= 2) return;

    store.selectCard(card);
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleRestart = () => {
    store.resetGame(store.gameState.allGameWords.length);
    initializeExercise();
  };

  if (store.gameState.isComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ResultCard
          score={store.gameState.score}
          correctAnswers={store.gameState.correctAnswers}
          wrongAnswers={store.gameState.errorWords.size}
          totalQuestions={store.gameState.allGameWords.length}
          canRetry={store.canRetry()}
          onRestart={handleRestart}
          onRetry={store.startRetryMode}
          onBackToHome={handleBackToHome}
        />
      </div>
    );
  }

  if (store.gameState.allGameWords.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Create cards for the current section
  const currentSectionWords = store.sectionState.gameWords;
  const cards: Array<{
    id: number;
    kanji: string;
    hiragana: string;
    romaji: string;
    meanings: { en: string; id: string };
    type: "japanese" | "meaning";
  }> = [];

  currentSectionWords.forEach((word) => {
    // Japanese card (kanji or hiragana)
    cards.push({
      ...word,
      type: "japanese" as const,
    });

    // Meaning card
    cards.push({
      ...word,
      type: "meaning" as const,
    });
  });

  // Shuffle cards for display
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <VocabularyPairingSectionProgress
        currentSection={store.getCurrentSectionNumber()}
        totalSections={store.getTotalSections()}
        matchedPairs={store.sectionState.matchedPairs.size}
        totalPairs={store.sectionState.gameWords.length}
      />

      <VocabularyPairingGrid
        cards={shuffledCards}
        selectedCards={store.sectionState.selectedCards}
        matchedPairs={store.sectionState.matchedPairs}
        errorCards={store.sectionState.errorCards}
        onCardClick={handleCardClick}
      />
    </div>
  );
};
