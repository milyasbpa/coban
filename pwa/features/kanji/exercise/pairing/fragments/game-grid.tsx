"use client";

import { useMemo } from "react";
import { PairingCard } from "../components/pairing-card";
import { usePairingGameStore } from "../store/pairing-game.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { shuffleArray, PairingWord } from "../utils";
import { playAudio } from "@/pwa/core/lib/utils/audio";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import { useSearchParams } from "next/navigation";
import type { QuestionResult } from "@/pwa/features/score/model/score";

interface SelectedCard {
  id: string;
  type: "kanji" | "meaning";
  content: string;
}

export function GameGrid() {
  const { isIndonesian } = useLanguage();
  const searchParams = useSearchParams();
  const { updateExerciseScore, updateKanjiMastery, initializeUser, currentUserScore, isInitialized } = useScoreStore();

  // Real-time per-word score integration
  const integrateWordScore = async (word: PairingWord, isCorrect: boolean) => {
    try {
      // Auto-initialize user if not already initialized
      if (!isInitialized || !currentUserScore) {
        console.log('ScoreStore: Auto-initializing user for word:', word.kanji);
        await initializeUser('default-user', level as "N5" | "N4" | "N3" | "N2" | "N1");
      }

      // Import required utilities for word-based scoring
      const { ScoreCalculator } = await import("@/pwa/features/score/utils/score-calculator");
      const { WordIdGenerator } = await import("@/pwa/features/score/utils/word-id-generator");
      const { KanjiWordMapper } = await import("@/pwa/features/score/utils/kanji-word-mapper");

      // Extract kanji character from the word
      const kanjiCharacter = word.kanji.charAt(0);
      
      // Get accurate kanji information using the extracted kanji character
      const kanjiInfo = KanjiWordMapper.getKanjiInfo(kanjiCharacter, level);
      
      // Generate unique word ID based on actual word content
      const wordId = WordIdGenerator.generateWordId(word.kanji, kanjiInfo.kanjiId, 0);

      const wordResult: QuestionResult = {
        kanjiId: kanjiInfo.kanjiId,
        kanji: kanjiCharacter,
        isCorrect,
        wordId,
        word: word.kanji,
        exerciseType: "pairing" as const,
      };

      console.log(`Real-time word integration:`, {
        word: word.kanji,
        kanjiCharacter,
        isCorrect,
        kanjiId: kanjiInfo.kanjiId
      });

      // Update word mastery immediately
      updateKanjiMastery(kanjiInfo.kanjiId, kanjiCharacter, [wordResult]);
      
    } catch (error) {
      console.error('Error in real-time word score integration:', error);
    }
  };

  // Get URL parameters for score tracking
  const lessonId = searchParams.get("lessonId");
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";

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
    finishRetryMode,
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete,
  } = usePairingGameStore();

  // Create shuffled meanings based on current language
  const shuffledMeanings = useMemo(() => {
    const meanings = gameWords.map((w: PairingWord) =>
      isIndonesian ? w.meaning_id : w.meaning_en
    );
    const shuffled = shuffleArray(meanings);
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

          // ✅ REAL-TIME Per-Word Score Integration
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
                  
                  console.log("Pairing exercise completed - all word scores already integrated in real-time");
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

          // ✅ REAL-TIME Per-Word Score Integration for Wrong Match
          const wrongWord = gameWords.find(w => w.kanji === kanjiCard.id);
          if (wrongWord) {
            integrateWordScore(wrongWord, false);
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
                handleCardClick(gameWord.kanji, "kanji");
                playAudio(gameWord.furigana);
              }}
            />
          );
        })}
      </div>

      {/* Right Column - Meanings */}
      <div className="space-y-3">
        {shuffledMeanings.map((meaning: string) => (
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
            onClick={() => handleCardClick(meaning, "meaning")}
          />
        ))}
      </div>
    </div>
  );
}
