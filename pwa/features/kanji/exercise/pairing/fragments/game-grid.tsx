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
import type { QuestionResult } from "@/pwa/features/score/model/score";
import { useExerciseSearchParams } from "../../utils/hooks";

export function GameGrid() {
  const { language } = useLanguage();
  const {
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
    sectionState: { gameWords },
    sectionState: { selectedCards, matchedPairs, errorCards },
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

        // Since SelectedCard extends PairingWord, we can check if they reference the same word
        // by comparing their PairingWord IDs
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

          console.log(newMatchedPairs, "ini new matched pairs");

          setMatchedPairs(newMatchedPairs);
          incrementCorrectPairs();
          setSelectedCards([]);
          removeWordError(kanjiCard.kanji);

          // REAL-TIME Per-Word Score Integration
          integrateWordScore(matchingWord, true);

          // Check if section is complete - sekarang 1 ID per word (bukan 2)
          if (newMatchedPairs.size >= gameWords.length) {
            setTimeout(() => {
              if (isRetryMode) {
                // Calculate retry results
                // newMatchedPairs berisi ID angka, perlu convert ke kanji untuk check error
                const correctOriginalWords = Array.from(newMatchedPairs).filter(
                  (wordId) => {
                    const word = gameWords.find(w => w.id === wordId);
                    return word && globalErrorWords.has(word.kanji);
                  }
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
          // Wrong match - show error (gunakan card string ID, bukan PairingWord.id)
          const kanjiCardId = getCardId("kanji", kanjiCard, language as SupportedLanguage);
          const meaningCardId = getCardId("meaning", meaningCard, language as SupportedLanguage);
          setErrorCards(new Set([kanjiCardId, meaningCardId]));

          // Track word errors based on the kanji (not individual cards)
          // Only the kanji determines if this is first error for this word
          addWordError(kanjiCard.kanji);

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
            key={`meaning-${meaning}-${language}`}
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
