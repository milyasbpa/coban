"use client";

import { useMemo } from "react";
import { PairingCard } from "../components/pairing-card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";

interface SelectedCard {
  id: string;
  type: "kanji" | "meaning";
  content: string;
}

export function GameGrid() {
  const { isIndonesian } = useLanguage();

  // Store - get all game grid state from store
  const {
    gameStats,
    gameWords,
    shuffledKanji,
    selectedCards,
    matchedPairs,
    errorCards,
    updateStats,
    addWordError,
    setSelectedCards,
    setMatchedPairs,
    setErrorCards,
    removeWordError,
    isRetryMode,
    globalWordsWithErrors,
    finishRetryMode,
  } = usePairingGameStore();

  // Create shuffled meanings based on current language
  const shuffledMeanings = useMemo(() => {
    const meanings = gameWords.map((w: any) =>
      isIndonesian ? w.meaning_id : w.meaning_en
    );
    const shuffled = [...meanings];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [gameWords, isIndonesian]);

  const handleCardClick = (id: string, type: "kanji" | "meaning") => {
    if (matchedPairs.has(id) || errorCards.has(id)) return;

    const content = type === "kanji" ? id : id; // We'll use the meaning directly as id
    const newCard: SelectedCard = { id, type, content };

    if (selectedCards.length === 0) {
      setSelectedCards([newCard]);
    } else if (selectedCards.length === 1) {
      const firstCard = selectedCards[0];

      // Check if it's a valid pair
      if (firstCard.type !== type) {
        const kanjiCard = firstCard.type === "kanji" ? firstCard : newCard;
        const meaningCard = firstCard.type === "meaning" ? firstCard : newCard;

        const matchingWord = gameWords.find((w: any) => {
          const meaningToMatch = isIndonesian ? w.meaning_id : w.meaning_en;
          return w.kanji === kanjiCard.id && meaningToMatch === meaningCard.id;
        });

        if (matchingWord) {
          // Correct match
          const newMatchedPairs = new Set([
            ...matchedPairs,
            kanjiCard.id,
            meaningCard.id,
          ]);

          setMatchedPairs(newMatchedPairs);
          updateStats({ correctPairs: gameStats.correctPairs + 1 });
          setSelectedCards([]);
          removeWordError(kanjiCard.id);

          // Check if section is complete - emit event for parent to handle
          if (newMatchedPairs.size >= gameWords.length * 2) {
            setTimeout(() => {
              if (isRetryMode) {
                // Calculate retry results
                const correctOriginalWords = Array.from(newMatchedPairs).filter(
                  (cardId) => globalWordsWithErrors.has(cardId)
                ).length;

                finishRetryMode({ correctCount: correctOriginalWords });

                // For retry mode, directly complete the game
                window.dispatchEvent(new CustomEvent("retryComplete"));
              } else {
                // Normal game flow - dispatch section completion
                window.dispatchEvent(new CustomEvent("sectionComplete"));
              }
            }, 500);
          }
        } else {
          // Wrong match - show error
          setErrorCards(new Set([kanjiCard.id, meaningCard.id]));

          // Track word errors based on the kanji (not individual cards)
          // Only the kanji determines if this is first error for this word
          addWordError(kanjiCard.id);

          // Update wrong attempts count (selalu bertambah untuk tracking)
          updateStats({ wrongAttempts: gameStats.wrongAttempts + 1 });

          // Clear error state after animation
          setTimeout(() => {
            setErrorCards(new Set());
            setSelectedCards([]);
          }, 800);
        }
      } else {
        // Same type selected, replace selection
        setSelectedCards([newCard]);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      {/* Left Column - Kanji */}
      <div className="space-y-3">
        {shuffledKanji.map((kanji: string) => {
          // Find the word data for this kanji to get furigana and reading
          const wordData = gameWords.find((w: any) => w.kanji === kanji);

          return (
            <PairingCard
              key={kanji}
              id={kanji}
              content={kanji}
              furigana={wordData?.furigana}
              romanji={wordData?.reading}
              type="kanji"
              isSelected={selectedCards.some(
                (c: SelectedCard) => c.id === kanji
              )}
              isMatched={matchedPairs.has(kanji)}
              isError={errorCards.has(kanji)}
              onClick={handleCardClick}
            />
          );
        })}
      </div>

      {/* Right Column - Meanings */}
      <div className="space-y-3">
        {shuffledMeanings.map((meaning: string, index: number) => (
          <PairingCard
            key={`meaning-${meaning}-${isIndonesian ? "id" : "en"}`}
            id={meaning}
            content={meaning}
            type="meaning"
            isSelected={selectedCards.some(
              (c: SelectedCard) => c.id === meaning
            )}
            isMatched={matchedPairs.has(meaning)}
            isError={errorCards.has(meaning)}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
}
