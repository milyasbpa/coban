import { create } from "zustand";
import { VocabularyExerciseWord } from "../../shared/types";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { shuffleArray } from "@/pwa/features/kanji/exercise/pairing";

export interface VocabularyPairingWord extends VocabularyExerciseWord {
  // Additional pairing-specific fields if needed
}

export interface VocabularySelectedCard extends VocabularyPairingWord {
  type: "japanese" | "meaning"; // japanese can be kanji or hiragana
}

export interface VocabularyGameState {
  allGameWords: VocabularyPairingWord[]; // Global master data
  isRetryMode: boolean;
  score: number;
  isComplete: boolean;
  correctAnswers: number;
  correctPairs: number; // Track correct pairs like kanji
  errorWords: Set<string>;
}

export interface VocabularySectionState {
  currentSectionIndex: number;
  allSections: VocabularyPairingWord[][];
  gameWords: VocabularyPairingWord[]; // Current section words for UI rendering
  selectedCards: VocabularySelectedCard[]; // Current section UI interaction state
  matchedPairs: Set<number>; // Current section matched pairs (use numeric ID like kanji)
  errorCards: Set<string>; // Current section error cards (use string ID for display)
  errorWords: Set<string>; // Current section error words
}

export interface VocabularyPairingExerciseState {
  // Semantic State Groups
  gameState: VocabularyGameState;
  sectionState: VocabularySectionState;

  // Computed values
  getProgress: () => number;
  getTotalSections: () => number;
  getCurrentSectionNumber: () => number;
  getIsCurrentSectionComplete: () => boolean;
  canRetry: () => boolean;
  getSectionTotalWords: () => number;
  getTotalGameWords: () => number; // Get total words across all sections

  // Game State Actions
  setGameComplete: (complete: boolean) => void;
  resetGame: (totalWords: number) => void;
  calculateAndSetScore: () => void;
  addWordError: (word: string) => boolean;
  removeWordError: (word: string) => boolean;
  resetWordsWithErrors: () => void;
  incrementCorrectPairs: () => void;

  // Retry Actions
  startRetryMode: () => void;
  generateRetrySession: () => void;
  finishRetryMode: (retryResults: { correctCount: number }) => void;

  // Section Management Actions
  setCurrentSectionIndex: (index: number) => void;
  setAllSections: (sections: VocabularyPairingWord[][]) => void;
  moveToNextSection: () => boolean;
  resetSectionIndex: () => void;

  // Game Initialization Actions
  initializeGame: (params: {
    categoryId: string;
    level: string;
    selectedVocabularyIds?: number[];
  }) => void;

  // Game Grid Actions
  loadSection: (sectionWords: VocabularyPairingWord[]) => void;
  setAllGameWords: (allWords: VocabularyPairingWord[]) => void;
  setSelectedCards: (cards: VocabularySelectedCard[]) => void;
  setMatchedPairs: (pairs: Set<number>) => void;
  setErrorCards: (errors: Set<string>) => void;
  checkSectionComplete: () => boolean;

  // Card Selection Actions
  selectCard: (card: VocabularySelectedCard) => void;
  clearSelectedCards: () => void;
  checkPair: () => boolean;
  markUnmatchedAsErrors: () => void;
}

export const useVocabularyPairingExerciseStore =
  create<VocabularyPairingExerciseState>((set, get) => ({
    // Semantic State Groups
    gameState: {
      allGameWords: [],
      isRetryMode: false,
      score: 100,
      isComplete: false,
      correctAnswers: 0,
      correctPairs: 0,
      errorWords: new Set(),
    },
    sectionState: {
      currentSectionIndex: 0,
      allSections: [],
      gameWords: [],
      selectedCards: [],
      matchedPairs: new Set(),
      errorCards: new Set(),
      errorWords: new Set(),
    },

    // Computed values
    getProgress: () => {
      const {
        sectionState: { currentSectionIndex, allSections },
      } = get();
      return allSections.length > 0
        ? ((currentSectionIndex + 1) / allSections.length) * 100
        : 0;
    },

    getTotalSections: () => {
      const {
        sectionState: { allSections },
      } = get();
      return allSections.length;
    },

    getCurrentSectionNumber: () => {
      const {
        sectionState: { currentSectionIndex },
      } = get();
      return currentSectionIndex + 1;
    },

    getIsCurrentSectionComplete: () => {
      const {
        sectionState: { gameWords, matchedPairs },
      } = get();
      return gameWords.length > 0 && matchedPairs.size === gameWords.length;
    },

    canRetry: () => {
      const {
        gameState: { errorWords },
        sectionState: { errorWords: sectionErrorWords },
      } = get();
      const allWrongWords = new Set([...errorWords, ...sectionErrorWords]);
      return allWrongWords.size > 0; // Can retry if there are any wrong words globally
    },

    getSectionTotalWords: () => {
      const {
        sectionState: { gameWords },
      } = get();
      return gameWords.length;
    },

    getTotalGameWords: () => {
      const {
        gameState: { allGameWords },
      } = get();
      return allGameWords.length;
    },

    // Game State Actions
    setGameComplete: (complete) =>
      set((state) => ({
        gameState: { ...state.gameState, isComplete: complete },
      })),

    resetGame: (totalWords) =>
      set({
        gameState: {
          allGameWords: [],
          isRetryMode: false,
          score: 100,
          isComplete: false,
          correctAnswers: 0,
          correctPairs: 0,
          errorWords: new Set(),
        },
        sectionState: {
          currentSectionIndex: 0,
          allSections: [],
          gameWords: [],
          selectedCards: [],
          matchedPairs: new Set(),
          errorCards: new Set(),
          errorWords: new Set(),
        },
      }),

    calculateAndSetScore: () => {
      const {
        gameState: { isRetryMode, allGameWords, errorWords },
        sectionState: { errorWords: sectionErrorWords },
      } = get();
      if (allGameWords.length === 0) return;

      let newScore;
      if (isRetryMode) {
        // During retry mode, calculate from global error words + current section error words
        const penaltyPerWord = 100 / allGameWords.length;
        const allCurrentWrongWords = new Set([
          ...errorWords,
          ...sectionErrorWords,
        ]);
        const totalUniqueWrongWords = allCurrentWrongWords.size;
        const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
        newScore = Math.max(0, 100 - totalPenalty);
      } else {
        // Normal mode: calculate from error words
        const penaltyPerWord = 100 / allGameWords.length;
        const totalUniqueWrongWords = errorWords.size;
        const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
        newScore = Math.max(0, 100 - totalPenalty);
      }

      const correctCount = allGameWords.length - errorWords.size;

      set((state) => ({
        gameState: {
          ...state.gameState,
          score: Math.round(newScore),
          correctAnswers: correctCount,
        },
      }));
    },

    addWordError: (word) => {
      const {
        sectionState: { errorWords: sectionErrorWords },
      } = get();
      
      const newSectionErrorWords = new Set(sectionErrorWords);
      const isFirstError = !newSectionErrorWords.has(word);
      newSectionErrorWords.add(word);

      // Only penalize score on first error for this specific word
      if (isFirstError) {
        set((state) => {
          // During retry mode, calculate penalty from global + section errors
          if (state.gameState.isRetryMode) {
            const penaltyPerWord = 100 / state.gameState.allGameWords.length;
            const allCurrentWrongWords = new Set([
              ...state.gameState.errorWords,
              ...newSectionErrorWords,
            ]);
            const totalPenalty = allCurrentWrongWords.size * penaltyPerWord;
            const newScore = Math.max(0, 100 - totalPenalty);

            return {
              sectionState: {
                ...state.sectionState,
                errorWords: newSectionErrorWords,
              },
              gameState: {
                ...state.gameState,
                score: Math.round(newScore),
              },
            };
          }

          // Normal mode: add to global error words
          const newGlobalErrorWords = new Set(state.gameState.errorWords);
          newGlobalErrorWords.add(word);
          const penaltyPerWord = 100 / state.gameState.allGameWords.length;
          const totalPenalty = newGlobalErrorWords.size * penaltyPerWord;
          const newScore = Math.max(0, 100 - totalPenalty);

          return {
            sectionState: {
              ...state.sectionState,
              errorWords: newSectionErrorWords,
            },
            gameState: {
              ...state.gameState,
              errorWords: newGlobalErrorWords,
              score: Math.round(newScore),
            },
          };
        });
      } else {
        // Update section error words even if not first error
        set((state) => ({
          sectionState: {
            ...state.sectionState,
            errorWords: newSectionErrorWords,
          },
        }));
      }

      return isFirstError;
    },

    removeWordError: (word) => {
      const {
        sectionState: { errorWords: sectionErrorWords },
      } = get();
      const newSectionErrorWords = new Set(sectionErrorWords);
      const wasRemoved = newSectionErrorWords.delete(word);

      // DO NOT recalculate score - once wrong in first attempt, score stays penalized
      // This is correct behavior: score should not increase after fixing mistakes
      if (wasRemoved) {
        set((state) => ({
          sectionState: {
            ...state.sectionState,
            errorWords: newSectionErrorWords,
          },
        }));
      }

      return wasRemoved;
    },

    resetWordsWithErrors: () =>
      set((state) => ({
        gameState: { ...state.gameState, errorWords: new Set() },
      })),

    incrementCorrectPairs: () =>
      set((state) => ({
        gameState: {
          ...state.gameState,
          correctPairs: state.gameState.correctPairs + 1,
        },
      })),

    // Retry Actions
    startRetryMode: () => {
      const {
        sectionState: { errorWords: sectionErrorWords },
      } = get();

      // Merge current section wrong words to global tracking
      set((state) => {
        const newGlobalErrorWords = new Set([
          ...state.gameState.errorWords,
          ...sectionErrorWords,
        ]);

        return {
          gameState: {
            ...state.gameState,
            isRetryMode: true,
            errorWords: newGlobalErrorWords,
            isComplete: false,
          },
        };
      });
    },

    generateRetrySession: () => {
      const {
        gameState: { errorWords, allGameWords },
      } = get();
      const wrongWords = Array.from(errorWords);

      // Filter words that have errors for retry
      const retryWords = allGameWords.filter(
        (word) => errorWords.has(word.kanji) || errorWords.has(word.hiragana)
      );

      // Create sections for retry (smaller sections for focused practice)
      const sections = createSections(retryWords, 4); // 4 pairs per section for retry

      set((state) => ({
        sectionState: {
          ...state.sectionState,
          allSections: sections,
          currentSectionIndex: 0,
          selectedCards: [],
          matchedPairs: new Set(),
          errorCards: new Set(),
          errorWords: new Set(), // Reset current section error tracking
        },
        gameState: {
          ...state.gameState,
          correctPairs: 0, // Reset correct pairs for retry session
        },
      }));

      // Load first retry section
      if (sections.length > 0) {
        get().loadSection(sections[0]);
      }
    },

    finishRetryMode: (retryResults) => {
      const {
        sectionState: { errorWords: sectionErrorWords },
      } = get();

      // Merge final section errors into global
      set((state) => {
        const finalErrorWords = new Set([
          ...state.gameState.errorWords,
          ...sectionErrorWords,
        ]);

        return {
          gameState: {
            ...state.gameState,
            isRetryMode: false,
            isComplete: true,
            errorWords: finalErrorWords,
            correctAnswers: retryResults.correctCount,
          },
        };
      });
    },

    // Section Management Actions
    setCurrentSectionIndex: (index) =>
      set((state) => ({
        sectionState: { ...state.sectionState, currentSectionIndex: index },
      })),

    setAllSections: (sections) =>
      set((state) => ({
        sectionState: { ...state.sectionState, allSections: sections },
      })),

    moveToNextSection: () => {
      const {
        sectionState: { currentSectionIndex, allSections },
      } = get();

      if (currentSectionIndex + 1 < allSections.length) {
        const nextIndex = currentSectionIndex + 1;
        set((state) => ({
          sectionState: {
            ...state.sectionState,
            currentSectionIndex: nextIndex,
            matchedPairs: new Set(),
            errorCards: new Set(),
            selectedCards: [],
          },
        }));

        // Load next section
        get().loadSection(allSections[nextIndex]);
        return true;
      } else {
        // Game complete
        get().calculateAndSetScore();
        get().setGameComplete(true);
        return false;
      }
    },

    resetSectionIndex: () =>
      set((state) => ({
        sectionState: { ...state.sectionState, currentSectionIndex: 0 },
      })),

    // Game Initialization Actions
    initializeGame: (params) => {
      const { categoryId, level, selectedVocabularyIds } = params;

      // Get vocabulary category
      const vocabularyCategory =
        VocabularyService.getVocabularyByCategoryString(categoryId, level);

      if (!vocabularyCategory) {
        console.error("Vocabulary category not found");
        return;
      }

      // Filter vocabulary if selectedVocabularyIds provided (from selection mode)
      let words = vocabularyCategory.vocabulary;
      if (selectedVocabularyIds && selectedVocabularyIds.length > 0) {
        words = words.filter((word: VocabularyPairingWord) =>
          selectedVocabularyIds.includes(word.id)
        );
      }

      if (words.length === 0) {
        console.error("No vocabulary words available for exercise");
        return;
      }

      // Shuffle all words first for better randomness across sections
      const shuffledWords = shuffleArray(words);

      // Create sections of 5 pairs each (10 cards per section)
      const sections = createSections(shuffledWords, 5);

      set({
        gameState: {
          allGameWords: shuffledWords, // Store shuffled words for retry system
          isRetryMode: false,
          score: 100,
          isComplete: false,
          correctAnswers: 0,
          correctPairs: 0,
          errorWords: new Set(),
        },
        sectionState: {
          currentSectionIndex: 0,
          allSections: sections,
          gameWords: [],
          selectedCards: [],
          matchedPairs: new Set(),
          errorCards: new Set(),
          errorWords: new Set(),
        },
      });

      // Load first section
      if (sections.length > 0) {
        get().loadSection(sections[0]);
      }
    },

    // Game Grid Actions
    loadSection: (sectionWords) => {
      // Create cards for the grid (japanese + meaning pairs)
      const cards: VocabularySelectedCard[] = [];

      sectionWords.forEach((word) => {
        // Japanese card (can be kanji or hiragana)
        cards.push({
          ...word,
          type: "japanese",
        });

        // Meaning card
        cards.push({
          ...word,
          type: "meaning",
        });
      });

      // Shuffle the cards
      const shuffledCards = shuffleArray(cards);

      set((state) => ({
        sectionState: {
          ...state.sectionState,
          gameWords: sectionWords,
          selectedCards: [],
          matchedPairs: new Set(),
          errorCards: new Set(),
        },
      }));
    },

    setAllGameWords: (allWords) =>
      set((state) => ({
        gameState: { ...state.gameState, allGameWords: allWords },
      })),

    setSelectedCards: (cards) =>
      set((state) => ({
        sectionState: { ...state.sectionState, selectedCards: cards },
      })),

    setMatchedPairs: (pairs) =>
      set((state) => ({
        sectionState: { ...state.sectionState, matchedPairs: pairs },
      })),

    setErrorCards: (errors) =>
      set((state) => ({
        sectionState: { ...state.sectionState, errorCards: errors },
      })),

    checkSectionComplete: () => {
      return get().getIsCurrentSectionComplete();
    },

    // Card Selection Actions
    selectCard: (card) => {
      const {
        sectionState: { selectedCards },
      } = get();

      if (selectedCards.length < 2) {
        const newSelectedCards = [...selectedCards, card];
        set((state) => ({
          sectionState: {
            ...state.sectionState,
            selectedCards: newSelectedCards,
          },
        }));

        // Auto-check pair when 2 cards selected
        if (newSelectedCards.length === 2) {
          setTimeout(() => {
            get().checkPair();
          }, 500); // Small delay for UI feedback
        }
      }
    },

    clearSelectedCards: () =>
      set((state) => ({
        sectionState: { ...state.sectionState, selectedCards: [] },
      })),

    checkPair: () => {
      const {
        sectionState: { selectedCards, matchedPairs, errorCards },
      } = get();

      if (selectedCards.length !== 2) return false;

      const [card1, card2] = selectedCards;
      const isMatch = card1.id === card2.id && card1.type !== card2.type;

      if (isMatch) {
        // Correct pair - use numeric ID like kanji
        const newMatchedPairs = new Set(matchedPairs);
        newMatchedPairs.add(card1.id);

        set((state) => ({
          sectionState: {
            ...state.sectionState,
            matchedPairs: newMatchedPairs,
            selectedCards: [],
          },
        }));

        // Check if section is complete
        if (get().checkSectionComplete()) {
          setTimeout(() => {
            get().moveToNextSection();
          }, 1000);
        }

        return true;
      } else {
        // Wrong pair
        const newErrorCards = new Set(errorCards);
        newErrorCards.add(`${card1.id}-${card1.type}`);
        newErrorCards.add(`${card2.id}-${card2.type}`);

        // Add words to error tracking
        get().addWordError(card1.kanji || card1.hiragana);
        get().addWordError(card2.kanji || card2.hiragana);

        set((state) => ({
          sectionState: {
            ...state.sectionState,
            errorCards: newErrorCards,
            selectedCards: [],
          },
        }));

        // Clear error highlighting after delay
        setTimeout(() => {
          set((state) => ({
            sectionState: {
              ...state.sectionState,
              errorCards: new Set(),
            },
          }));
        }, 1500);

        return false;
      }
    },

    markUnmatchedAsErrors: () => {
      const {
        sectionState: { gameWords, matchedPairs },
      } = get();

      // Mark all unmatched words as errors
      gameWords.forEach((word) => {
        if (!matchedPairs.has(word.id)) {
          get().addWordError(word.kanji || word.hiragana);
        }
      });
    },
  }));

// Helper function to create sections
function createSections(
  words: VocabularyPairingWord[],
  pairsPerSection: number
): VocabularyPairingWord[][] {
  const sections: VocabularyPairingWord[][] = [];

  for (let i = 0; i < words.length; i += pairsPerSection) {
    const section = words.slice(i, i + pairsPerSection);
    if (section.length > 0) {
      sections.push(section);
    }
  }

  return sections;
}
