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

                  // Integrate with Score Calculation System
                  const integrateWithScoreSystem = async () => {
                    // Auto-initialize user if not already initialized
                    if (!isInitialized || !currentUserScore) {
                      console.log('ScoreStore: Auto-initializing user...');
                      await initializeUser('default-user', level as "N5" | "N4" | "N3" | "N2" | "N1");
                    }

                    // Import required utilities for word-based scoring
                    const { ScoreCalculator } = await import("@/pwa/features/score/utils/score-calculator");
                    const { WordIdGenerator } = await import("@/pwa/features/score/utils/word-id-generator");
                    const { KanjiWordMapper } = await import("@/pwa/features/score/utils/kanji-word-mapper");

                    // Create word-based question results using accurate kanji mapping
                    const wordResults: QuestionResult[] = gameWords.map((word, index) => {
                      const isCorrect = !globalWordsWithErrors.has(word.kanji);
                      
                      // Get accurate kanji information using mapper
                      const kanjiInfo = KanjiWordMapper.getKanjiInfo(word.kanji, level);
                      
                      // Generate word ID for this word
                      const wordId = WordIdGenerator.generateWordId(word.kanji, kanjiInfo.kanjiId, index);

                      return {
                        kanjiId: kanjiInfo.kanjiId,
                        kanji: kanjiInfo.kanjiCharacter,
                        isCorrect,
                        wordId,
                        word: word.kanji,
                        exerciseType: "pairing" as const,
                      };
                    });

                    // Group results by kanji for word-based processing
                    const resultsByKanji = wordResults.reduce((acc, result) => {
                      if (!acc[result.kanjiId]) {
                        acc[result.kanjiId] = [];
                      }
                      acc[result.kanjiId].push(result);
                      return acc;
                    }, {} as Record<string, QuestionResult[]>);

                    // Update word-based scoring for each kanji
                    Object.entries(resultsByKanji).forEach(([kanjiId, results]) => {
                      // Get accurate total words for this kanji
                      const firstWord = results[0]?.word;
                      const totalWordsInKanji = firstWord ? KanjiWordMapper.getTotalWordsForKanji(firstWord, level) : 1;
                      
                      // Update each word's mastery
                      results.forEach(result => {
                        updateKanjiMastery(kanjiId, result.kanji, [result]);
                      });
                    });

                    console.log("Word-based scoring integration completed for pairing exercise");
                  };

                  // Call the integration function
                  integrateWithScoreSystem();
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
