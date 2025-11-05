"use client";

import { useMemo, useState } from "react";
import { PairingCard } from "../components/pairing-card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { shuffleArray } from "../utils";
import { PairingWord, SelectedCard } from "../types";
import { playAudio } from "@/pwa/core/lib/utils/audio";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import { useSearchParams } from "next/navigation";
import type { QuestionResult } from "@/pwa/features/score/model/score";
import { useExerciseSearchParams } from "../../utils/hooks";

export function GameGrid() {
  const { isIndonesian } = useLanguage();
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
    gameWords,
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
    wordsWithErrors,
    finishRetryMode,
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete,
  } = usePairingGameStore();

  console.log(globalWordsWithErrors, wordsWithErrors, "errors: global and words");

  // Helper function to get card ID based on type and pairingWord
  const getCardId = (type: "kanji" | "meaning", pairingWord: PairingWord): string => {
    return type === "kanji" 
      ? pairingWord.kanji 
      : (isIndonesian ? pairingWord.meanings.id : pairingWord.meanings.en);
  };

  // Create shuffled meanings with mapping to PairingWord
  const shuffledMeaningsData = useMemo(() => {
    const meaningsWithWords = gameWords.map((w: PairingWord) => ({
      meaning: isIndonesian ? w.meanings.id : w.meanings.en,
      word: w,
    }));
    const shuffled = shuffleArray(meaningsWithWords);
    return shuffled;
  }, [gameWords, isIndonesian]);

  const handleCardClick = (
    type: "kanji" | "meaning", 
    pairingWord: PairingWord
  ) => {
    // Get card ID using helper function
    const id = getCardId(type, pairingWord);
    
    if (matchedPairs.has(id) || errorCards.has(id)) return;

    const content = id;
    const newCard: SelectedCard = { 
      id, 
      type, 
      content,
      pairingWord // Store reference to the full PairingWord data
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
        
        // Since both cards now have pairingWord, we can do direct comparison
        if (kanjiCard.pairingWord && meaningCard.pairingWord) {
          // Check if both cards reference the same PairingWord
          matchingWord = kanjiCard.pairingWord.id === meaningCard.pairingWord.id 
            ? kanjiCard.pairingWord 
            : undefined;
        } else {
          // One of the cards doesn't have pairingWord, check by content
          const kanjiCardWord = kanjiCard.pairingWord;
          const meaningCardWord = meaningCard.pairingWord;
          
          if (kanjiCardWord) {
            const meaningToMatch = isIndonesian ? kanjiCardWord.meanings.id : kanjiCardWord.meanings.en;
            matchingWord = meaningToMatch === meaningCard.id ? kanjiCardWord : undefined;
          } else if (meaningCardWord) {
            matchingWord = meaningCardWord.kanji === kanjiCard.id ? meaningCardWord : undefined;
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
          updateStats({ correctPairs: gameStats.correctPairs + 1 });
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
                  (cardId) => globalWordsWithErrors.has(cardId)
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
          updateStats({ wrongAttempts: gameStats.wrongAttempts + 1 });

          // REAL-TIME Per-Word Score Integration for Wrong Match
          // Use direct reference from kanjiCard (since we always have pairingWord now)
          if (kanjiCard.pairingWord) {
            integrateWordScore(kanjiCard.pairingWord, false);
          }

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
            key={`meaning-${meaning}-${isIndonesian ? "id" : "en"}`}
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
