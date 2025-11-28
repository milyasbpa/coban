"use client";

import { useMemo, useState } from "react";
import { PairingCard } from "../components/pairing-card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { shuffleArray } from "../utils";
import { PairingWord, SelectedCard } from "../types";
import {
  getCardId,
  getMeaning,
  createMeaningsData,
  SupportedLanguage,
} from "@/pwa/features/kanji/shared/utils/language-helpers";
import { playAudio } from "@/pwa/core/lib/utils/audio";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { useExerciseSearchParams } from "../../utils/hooks";
import { integratePairingGameScore } from "../utils/scoring-integration";

export function PairingGameGrid() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useLoginStore();
  const {
    updateKanjiMastery,
    initializeUser,
    currentUserScore,
    isInitialized,
  } = useKanjiScoreStore();

  // Kanji scoring integration at game completion (only for authenticated users)
  const integrateGameScore = async () => {
    if (!isAuthenticated || !user) {
      console.log("⚠️ Guest user - score not saved");
      return;
    }

    await integratePairingGameScore(
      allGameWords,
      globalErrorWords,
      level,
      user.uid,
      updateKanjiMastery,
      initializeUser,
      isInitialized,
      currentUserScore
    );
  };

  const { level } = useExerciseSearchParams();

  // Store - get all game grid state from store
  const {
    sectionState: {
      selectedCards,
      matchedPairs,
      errorCards,
      allSections,
      currentSectionIndex,
    },
    gameState: { isRetryMode, errorWords: globalErrorWords, allGameWords },
    addWordError,
    setSelectedCards,
    setMatchedPairs,
    setErrorCards,
    removeWordError,
    finishRetryMode,
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete,
    incrementCorrectPairs,
  } = usePairingGameStore();

  const sectionWords = useMemo(() => {
    if (!allSections.length) return [];
    return allSections[currentSectionIndex];
  }, [allSections, currentSectionIndex]);

  // Create shuffled meanings with mapping to PairingWord
  const shuffledMeaningsData = useMemo(() => {
    const meaningsWithWords = createMeaningsData(
      sectionWords,
      language as SupportedLanguage
    );
    const shuffled = shuffleArray(meaningsWithWords);
    return shuffled;
  }, [sectionWords, language]);

  const handleCardClick = (
    type: "kanji" | "meaning",
    pairingWord: PairingWord
  ) => {
    // Get card ID using helper function
    const cardId = getCardId(type, pairingWord, language as SupportedLanguage);

    // Check if this word is already matched (using PairingWord.id) or has error (using card string ID)
    if (matchedPairs.has(pairingWord.id) || errorCards.has(cardId)) return;

    const newCard: SelectedCard = {
      ...pairingWord, // Spread all PairingWord properties
      type,
    };

    if (selectedCards.length === 0) {
      setSelectedCards([newCard]);
    } else if (selectedCards.length === 1) {
      const firstCard = selectedCards[0];

      // Check if it's a valid pair
      if (firstCard.type !== type) {
        const kanjiCard = firstCard.type === "kanji" ? firstCard : newCard;
        const meaningCard = firstCard.type === "meaning" ? firstCard : newCard;

        // Direct matching using pairingWord references
        let matchingWord: PairingWord | undefined;

        // Since SelectedCard extends PairingWord, we can check if they reference the same word by comparing their PairingWord IDs
        if (kanjiCard.id === meaningCard.id) {
          matchingWord = kanjiCard; // Both reference the same PairingWord
        } else {
          // Additional validation - check if kanji card's meaning matches meaning card's content
          const kanjiMeaning = getMeaning(
            kanjiCard,
            language as SupportedLanguage
          );
          const meaningCardId = getCardId(
            "meaning",
            meaningCard,
            language as SupportedLanguage
          );

          if (kanjiMeaning === meaningCardId) {
            matchingWord = kanjiCard;
          }
        }

        if (matchingWord) {
          // Correct match - hanya simpan ID asli PairingWord ke matchedPairs
          const newMatchedPairs = new Set([
            ...matchedPairs,
            matchingWord.id, // Hanya simpan ID angka asli dari PairingWord
          ]);

          setMatchedPairs(newMatchedPairs);
          incrementCorrectPairs();
          setSelectedCards([]);
          removeWordError(kanjiCard.kanji);

          // Score will be integrated at game completion

          // Check if section is complete - sekarang 1 ID per word (bukan 2)
          if (newMatchedPairs.size >= sectionWords.length) {
            setTimeout(() => {
              if (isRetryMode) {
                // Calculate retry results
                // newMatchedPairs berisi ID angka, perlu convert ke kanji untuk check error
                const correctOriginalWords = Array.from(newMatchedPairs).filter(
                  (wordId) => {
                    const word = sectionWords.find((w) => w.id === wordId);
                    return word && globalErrorWords.has(word.kanji);
                  }
                ).length;

                finishRetryMode({ correctCount: correctOriginalWords });
                
                // Integrate kanji scoring for retry completion
                integrateGameScore();
              } else {
                const hasMoreSections = moveToNextSection();
                if (!hasMoreSections) {
                  // Game complete
                  calculateAndSetScore();
                  setGameComplete(true);
                  
                  // Integrate kanji scoring at game completion
                  integrateGameScore();
                }
              }
            }, 500);
          }
        } else {
          // Wrong match - show error (gunakan card string ID, bukan PairingWord.id)
          const kanjiCardId = getCardId(
            "kanji",
            kanjiCard,
            language as SupportedLanguage
          );
          const meaningCardId = getCardId(
            "meaning",
            meaningCard,
            language as SupportedLanguage
          );
          setErrorCards(new Set([kanjiCardId, meaningCardId]));

          // Track word errors based on the kanji (not individual cards)
          // Only the kanji determines if this is first error for this word
          addWordError(kanjiCard.kanji);

          // Update wrong attempts count (selalu bertambah untuk tracking)
          // Remove wrongAttempts tracking as per architecture optimization

          // Score will be integrated at game completion

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
        {sectionWords.map((gameWord: PairingWord) => {
          return (
            <PairingCard
              key={gameWord.kanji}
              id={`kanji-${gameWord.id}`}
              content={gameWord.kanji}
              furigana={gameWord.furigana}
              romanji={gameWord.reading}
              type="kanji"
              isSelected={selectedCards.some(
                (c: SelectedCard) => c.id === gameWord.id && c.type === "kanji"
              )}
              isMatched={matchedPairs.has(gameWord.id)}
              isError={errorCards.has(gameWord.kanji)}
              onClick={() => {
                handleCardClick("kanji", gameWord);
                playAudio(gameWord.furigana);
              }}
            />
          );
        })}
      </div>

      {/* Right Column - Meanings */}
      <div className="space-y-3">
        {shuffledMeaningsData.map(({ meaning, word }) => (
          <PairingCard
            key={`meaning-${word.id}`}
            id={meaning}
            content={meaning}
            type="meaning"
            isSelected={selectedCards.some(
              (c: SelectedCard) => c.id === word.id && c.type === "meaning"
            )}
            isMatched={matchedPairs.has(word.id)}
            isError={errorCards.has(meaning)}
            onClick={() => handleCardClick("meaning", word)}
          />
        ))}
      </div>
    </div>
  );
}
