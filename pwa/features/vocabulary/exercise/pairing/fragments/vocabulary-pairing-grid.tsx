"use client";

import React, { useMemo } from "react";
import { VocabularyPairingCard } from "../components/vocabulary-pairing-card";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { useVocabularyPairingDisplayOptions } from "../store";
import {
  VocabularySelectedCard,
  VocabularyPairingWord,
} from "../store/vocabulary-pairing-exercise.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { useVocabularyExerciseSearchParams } from "../../utils/hooks";
import { integrateVocabularyPairingGameScore } from "../utils/scoring-integration";
import {
  getVocabularyCardId,
  getMeaning,
  createMeaningsData,
  SupportedLanguage,
} from "@/pwa/features/vocabulary/shared/utils/language-helpers";
import { playAudio } from "@/pwa/core/lib/utils/audio";

export const VocabularyPairingGrid: React.FC = () => {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useLoginStore();
  const { level, categoryId } = useVocabularyExerciseSearchParams();
  const { displaySound } = useVocabularyPairingDisplayOptions();

  const {
    sectionState: {
      gameWords,
      selectedCards,
      matchedPairs,
      errorCards,
      allSections,
      currentSectionIndex,
    },
    gameState: { isRetryMode, errorWords: globalErrorWords, allGameWords },
    setSelectedCards,
    setMatchedPairs,
    setErrorCards,
    addWordError,
    removeWordError,
    incrementCorrectPairs,
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete,
    finishRetryMode,
  } = useVocabularyPairingExerciseStore();

  // Vocabulary scoring integration at game completion (only for authenticated users)
  const integrateGameScore = async () => {
    if (!categoryId || !level) return;
    
    if (!isAuthenticated || !user) {
      console.log("⚠️ Guest user - score not saved");
      return;
    }

    console.log(categoryId, "ini category id");
    await integrateVocabularyPairingGameScore(
      allGameWords,
      globalErrorWords,
      level,
      categoryId,
      user.uid
    );
  };

  const sectionWords = useMemo(() => {
    if (!allSections.length) return [];
    return allSections[currentSectionIndex];
  }, [allSections, currentSectionIndex]);

  // Create shuffled Japanese words
  const shuffledJapaneseWords = useMemo(() => {
    return [...sectionWords].sort(() => Math.random() - 0.5);
  }, [sectionWords]);

  // Create shuffled meanings with mapping to VocabularyPairingWord
  const shuffledMeaningsData = useMemo(() => {
    const meaningsWithWords = createMeaningsData(
      sectionWords,
      language as SupportedLanguage
    );
    const shuffled = [...meaningsWithWords].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [sectionWords, language]);

  const handleCardClick = (
    type: "japanese" | "meaning",
    vocabularyWord: VocabularyPairingWord
  ) => {
    // Get card ID using helper function
    const cardId = getVocabularyCardId(
      type,
      vocabularyWord,
      language as SupportedLanguage
    );

    // Check if this word is already matched (using VocabularyPairingWord.id) or has error (using card string ID)
    if (matchedPairs.has(vocabularyWord.id) || errorCards.has(cardId)) return;

    const newCard: VocabularySelectedCard = {
      ...vocabularyWord,
      type,
    };

    if (selectedCards.length === 0) {
      setSelectedCards([newCard]);
    } else if (selectedCards.length === 1) {
      const firstCard = selectedCards[0];

      // Check if it's a valid pair
      if (firstCard.type !== type) {
        const japaneseCard =
          firstCard.type === "japanese" ? firstCard : newCard;
        const meaningCard = firstCard.type === "meaning" ? firstCard : newCard;

        // Direct matching using vocabularyWord references
        let matchingWord: VocabularyPairingWord | undefined;

        // Since VocabularySelectedCard extends VocabularyPairingWord, check if they reference the same word
        if (japaneseCard.id === meaningCard.id) {
          matchingWord = japaneseCard;
        } else {
          // Additional validation - check if japanese card's meaning matches meaning card's content
          const japaneseMeaning = getMeaning(
            japaneseCard,
            language as SupportedLanguage
          );
          const meaningCardId = getVocabularyCardId(
            "meaning",
            meaningCard,
            language as SupportedLanguage
          );

          if (japaneseMeaning === meaningCardId) {
            matchingWord = japaneseCard;
          }
        }

        if (matchingWord) {
          // Correct match - only save numeric ID to matchedPairs
          const newMatchedPairs = new Set([...matchedPairs, matchingWord.id]);

          setMatchedPairs(newMatchedPairs);
          incrementCorrectPairs();
          setSelectedCards([]);
          removeWordError(japaneseCard.kanji || japaneseCard.hiragana);

          // Score will be integrated at game completion

          // Check if section is complete
          if (newMatchedPairs.size >= sectionWords.length) {
            setTimeout(() => {
              if (isRetryMode) {
                // Calculate retry results
                const correctOriginalWords = Array.from(newMatchedPairs).filter(
                  (wordId) => {
                    const word = sectionWords.find((w) => w.id === wordId);
                    return (
                      word && globalErrorWords.has(word.kanji || word.hiragana)
                    );
                  }
                ).length;

                finishRetryMode({ correctCount: correctOriginalWords });

                // Integrate vocabulary scoring for retry completion
                integrateGameScore();
              } else {
                const hasMoreSections = moveToNextSection();
                if (!hasMoreSections) {
                  // Game complete
                  calculateAndSetScore();
                  setGameComplete(true);

                  // Integrate vocabulary scoring at game completion
                  integrateGameScore();
                }
              }
            }, 500);
          }
        } else {
          // Wrong match - show error (use card string ID, not VocabularyPairingWord.id)
          const japaneseCardId = getVocabularyCardId(
            "japanese",
            japaneseCard,
            language as SupportedLanguage
          );
          const meaningCardId = getVocabularyCardId(
            "meaning",
            meaningCard,
            language as SupportedLanguage
          );
          setErrorCards(new Set([japaneseCardId, meaningCardId]));

          // Track word errors based on the japanese word (not individual cards)
          addWordError(japaneseCard.kanji || japaneseCard.hiragana);

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
      {/* Left Column - Japanese (Kanji/Hiragana) */}
      <div className="space-y-3">
        {shuffledJapaneseWords.map((word: VocabularyPairingWord) => (
          <VocabularyPairingCard
            key={`japanese-${word.id}`}
            card={{ ...word, type: "japanese" }}
            onCardClick={(card) => {
              handleCardClick("japanese", word);
              if (displaySound) {
                playAudio(word.hiragana);
              }
            }}
          />
        ))}
      </div>

      {/* Right Column - Meanings */}
      <div className="space-y-3">
        {shuffledMeaningsData.map(({ meaning, word }) => (
          <VocabularyPairingCard
            key={`meaning-${word.id}`}
            card={{ ...word, type: "meaning" }}
            onCardClick={(card) => handleCardClick("meaning", word)}
          />
        ))}
      </div>
    </div>
  );
};
