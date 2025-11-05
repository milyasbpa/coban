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
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import { useSearchParams } from "next/navigation";
import type { QuestionResult } from "@/pwa/features/score/model/score";
import { useExerciseSearchParams } from "../../utils/hooks";

export function GameGrid() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const {
    updateExerciseScore,
    updateKanjiMastery,
    initializeUser,
    currentUserScore,
    isInitialized,
  } = useScoreStore();

  // Session-based tracking for first-attempt-only integration
  const [attemptedWordsInSession, setAttemptedWordsInSession] = useState<
    Set<string>
  >(new Set());

  // Helper functions for first-attempt tracking
  const hasAttemptedWord = (wordKey: string): boolean => {
    return attemptedWordsInSession.has(wordKey);
  };

  const markWordAsAttempted = (wordKey: string): void => {
    setAttemptedWordsInSession((prev) => new Set([...prev, wordKey]));
  };

  // Real-time per-word score integration (first-attempt-only)
  const integrateWordScore = async (word: PairingWord, isCorrect: boolean) => {
    try {
      // ✅ FIRST-ATTEMPT-ONLY: Check if word has been attempted in this session
      if (hasAttemptedWord(word.kanji)) {
        return; // Skip integration for subsequent attempts
      }

      // Mark word as attempted to prevent future integrations in this session
      markWordAsAttempted(word.kanji);

      // Auto-initialize user if not already initialized
      if (!isInitialized || !currentUserScore) {
        await initializeUser(
          "default-user",
          level as "N5" | "N4" | "N3" | "N2" | "N1"
        );
      }

      // Import required utilities for word-based scoring
      const { WordIdGenerator } = await import(
        "@/pwa/features/score/utils/word-id-generator"
      );
      const { KanjiWordMapper } = await import(
        "@/pwa/features/score/utils/kanji-word-mapper"
      );

      // Extract kanji character from the word
      const kanjiCharacter = word.kanji.charAt(0);

      // Get accurate kanji information using the extracted kanji character
      const kanjiInfo = KanjiWordMapper.getKanjiInfo(kanjiCharacter, level);

      // Generate unique word ID based on actual word content
      const wordId = WordIdGenerator.generateWordId(
        word.kanji,
        kanjiInfo.kanjiId,
        0
      );

      const wordResult: QuestionResult = {
        kanjiId: kanjiInfo.kanjiId,
        kanji: kanjiCharacter,
        isCorrect,
        wordId,
        word: word.kanji,
        exerciseType: "pairing" as const,
      };

      // Update word mastery immediately (first attempt only)
      updateKanjiMastery(kanjiInfo.kanjiId, kanjiCharacter, [wordResult]);
    } catch (error) {
      console.error("Error in first-attempt word score integration:", error);
    }
  };

  const { level } = useExerciseSearchParams();

  // Store - get all game grid state from store
  const {
    gameStats,
    sectionState: { gameWords },
    sectionState: { selectedCards, matchedPairs, errorCards },
    updateStats,
    addWordError,
    setSelectedCards,
    setMatchedPairs,
    setErrorCards,
    removeWordError,
    gameState: { isRetryMode, errorWords: globalErrorWords },
    sectionState: { errorWords: sectionErrorWords },
    finishRetryMode,
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete,
    incrementCorrectPairs,
  } = usePairingGameStore();

  console.log(
    globalErrorWords,
    sectionErrorWords,
    "errors: global and section"
  );

  // Helper function moved to language-helpers.ts for better reusability

  // Create shuffled meanings with mapping to PairingWord
  const shuffledMeaningsData = useMemo(() => {
    const meaningsWithWords = createMeaningsData(
      gameWords,
      language as SupportedLanguage
    );
    const shuffled = shuffleArray(meaningsWithWords);
    return shuffled;
  }, [gameWords, language]);

  const handleCardClick = (
    type: "kanji" | "meaning",
    pairingWord: PairingWord
  ) => {
    // Get card ID using helper function
    const id = getCardId(type, pairingWord, language as SupportedLanguage);

    if (matchedPairs.has(id) || errorCards.has(id)) return;

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

        // Since SelectedCard extends PairingWord, we can check if they reference the same word
        // by comparing their PairingWord IDs
        if (kanjiCard.id === meaningCard.id) {
          matchingWord = kanjiCard; // Both reference the same PairingWord
        } else {
          // Additional validation - check if kanji card's meaning matches meaning card's content
          const kanjiMeaning = getMeaning(kanjiCard, language as SupportedLanguage);
          const meaningCardId = getCardId("meaning", meaningCard, language as SupportedLanguage);
          
          if (kanjiMeaning === meaningCardId) {
            matchingWord = kanjiCard;
          }
        }

        if (matchingWord) {
          // Correct match
          const newMatchedPairs = new Set([
            ...matchedPairs,
            kanjiCard.id,
            meaningCard.id,
          ]);

          console.log(newMatchedPairs, "ini new matched pairs");

          setMatchedPairs(newMatchedPairs);
          incrementCorrectPairs();
          setSelectedCards([]);
          removeWordError(kanjiCard.id);

          // REAL-TIME Per-Word Score Integration
          integrateWordScore(matchingWord, true);

          // Check if section is complete - emit event for parent to handle
          if (newMatchedPairs.size >= gameWords.length * 2) {
            setTimeout(() => {
              if (isRetryMode) {
                // Calculate retry results
                const correctOriginalWords = Array.from(newMatchedPairs).filter(
                  (cardId) => globalErrorWords.has(cardId)
                ).length;

                finishRetryMode({ correctCount: correctOriginalWords });
              } else {
                const hasMoreSections = moveToNextSection();
                if (!hasMoreSections) {
                  // Game complete
                  calculateAndSetScore();
                  setGameComplete(true);

                  console.log(
                    "Pairing exercise completed - all word scores already integrated in real-time"
                  );
                }
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
          // Remove wrongAttempts tracking as per architecture optimization

          // REAL-TIME Per-Word Score Integration for Wrong Match
          // Use kanjiCard directly since it now extends PairingWord
          integrateWordScore(kanjiCard, false);

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

  console.log(matchedPairs, "ini matched pairs");

  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      {/* Left Column - Kanji */}
      <div className="space-y-3">
        {gameWords.map((gameWord: PairingWord) => {
          return (
            <PairingCard
              key={gameWord.kanji}
              id={gameWord.kanji}
              content={gameWord.kanji}
              furigana={gameWord.furigana}
              romanji={gameWord.reading}
              type="kanji"
              isSelected={selectedCards.some(
                (c: SelectedCard) => c.id === gameWord.kanji
              )}
              isMatched={matchedPairs.has(gameWord.kanji)}
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
            key={`meaning-${meaning}-${language}`}
            id={meaning}
            content={meaning}
            type="meaning"
            isSelected={selectedCards.some(
              (c: SelectedCard) => c.id === meaning
            )}
            isMatched={matchedPairs.has(meaning)}
            isError={errorCards.has(meaning)}
            onClick={() => handleCardClick("meaning", word)}
          />
        ))}
      </div>
    </div>
  );
}
