import { create } from "zustand";
import {
  getPairingGameData,
  getSections,
  shuffleArray as shuffleArrayUtil,
} from "../utils/pairing-game";
import {
  GameState,
  SectionState,
  PairingWord,
  SelectedCard,
  GameInitializationParams,
} from "../types";
import { GameDataService, WordErrorService } from "../services";

interface PairingGameState {
  // Semantic State Groups
  gameState: GameState;
  sectionState: SectionState;

  setGameComplete: (complete: boolean) => void;
  resetGame: (totalWords: number) => void;
  calculateAndSetScore: () => void;
  addWordError: (word: string) => boolean;
  removeWordError: (word: string) => boolean;
  resetWordsWithErrors: () => void;

  // Retry Actions
  startRetryMode: () => void;
  generateRetrySession: () => void;
  finishRetryMode: (retryResults: { correctCount: number }) => void;
  canRetry: () => boolean;

  // Section Management Actions
  setCurrentSectionIndex: (index: number) => void;
  setAllSections: (sections: PairingWord[][]) => void;
  moveToNextSection: () => boolean;
  resetSectionIndex: () => void;

  // Game Initialization Actions
  initializeGame: (params: GameInitializationParams) => void;

  // Game Grid Actions
  loadSection: () => void;
  setAllGameWords: (allWords: PairingWord[]) => void;
  setSelectedCards: (cards: SelectedCard[]) => void;
  setMatchedPairs: (pairs: Set<string>) => void;
  setErrorCards: (errors: Set<string>) => void;
  checkSectionComplete: () => boolean;

  // Computed Functions
  getGameTotalWords: () => number;
  getSectionTotalWords: () => number;

  // Helper Functions
  incrementCorrectPairs: () => void;
}

export const usePairingGameStore = create<PairingGameState>((set, get) => ({
  // Semantic State Groups
  gameState: {
    allGameWords: [],
    isRetryMode: false,
    score: 100,
    isComplete: false,
    correctPairs: 0,
    errorWords: new Set<string>(),
  },
  sectionState: {
    currentSectionIndex: 0,
    allSections: [],
    selectedCards: [],
    matchedPairs: new Set<string>(),
    errorCards: new Set<string>(),
    errorWords: new Set<string>(),
  },

  // Computed functions
  getGameTotalWords: () => get().gameState.allGameWords.length,
  getSectionTotalWords: () =>
    get().sectionState.allSections.reduce((acc, word) => {
      return acc + word.length;
    }, 0),

  // Helper functions for updating specific values
  incrementCorrectPairs: () =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        correctPairs: state.gameState.correctPairs + 1,
      },
    })),

  setGameComplete: (complete: boolean) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        isComplete: complete,
      },
    })),

  resetGame: () =>
    set({
      gameState: {
        allGameWords: [],
        isRetryMode: false,
        score: 100,
        isComplete: false,
        correctPairs: 0,
        errorWords: new Set<string>(),
      },
      sectionState: {
        currentSectionIndex: 0,
        allSections: [],
        selectedCards: [],
        matchedPairs: new Set<string>(),
        errorCards: new Set<string>(),
        errorWords: new Set<string>(),
      },
    }),

  calculateAndSetScore: () => {
    const {
      gameState: { isRetryMode, allGameWords, errorWords },
      sectionState: { errorWords: sectionErrorWords },
    } = get();

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

    set((state) => ({
      gameState: {
        ...state.gameState,
        score: Math.round(newScore),
      },
    }));
  },

  addWordError: (kanjiWord: string) => {
    const {
      sectionState: { errorWords },
    } = get();
    const { newErrorSet, isFirstError } = WordErrorService.addWordError(
      errorWords,
      kanjiWord
    );

    // Only penalize score on first error for this specific kanji word
    if (isFirstError) {
      set((state) => {
        // During retry mode, calculate penalty from global + section errors
        if (state.gameState.isRetryMode) {
          const penaltyPerWord = 100 / state.gameState.allGameWords.length;

          // Calculate total unique wrong words: global + current section
          const allCurrentWrongWords = new Set([
            ...state.gameState.errorWords,
            ...newErrorSet,
          ]);

          const totalUniqueWrongWords = allCurrentWrongWords.size;
          const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
          const newScore = Math.max(0, 100 - totalPenalty);

          return {
            sectionState: {
              ...state.sectionState,
              errorWords: newErrorSet,
            },
            gameState: {
              ...state.gameState,
              score: Math.round(newScore),
            },
          };
        }

        // Normal mode: Add to global error words and recalculate score
        const newGlobalErrorWords = new Set([
          ...state.gameState.errorWords,
          kanjiWord,
        ]);
        const penaltyPerWord = 100 / state.gameState.allGameWords.length;
        const totalPenalty = newGlobalErrorWords.size * penaltyPerWord;
        const newScore = Math.max(0, 100 - totalPenalty);

        return {
          sectionState: {
            ...state.sectionState,
            errorWords: newErrorSet,
          },
          gameState: {
            ...state.gameState,
            errorWords: newGlobalErrorWords,
            score: Math.round(newScore),
          },
        };
      });
    }

    return isFirstError;
  },

  removeWordError: (kanjiWord: string) => {
    const {
      sectionState: { errorWords },
      gameState,
    } = get();

    // Jika sectionState.errorWords kosong (tidak ada error di sesi saat ini),
    // maka remove dari gameState.errorWords
    if (errorWords.size === 0) {
      const wasInGlobal = gameState.errorWords.has(kanjiWord);
      if (wasInGlobal) {
        set((state) => {
          const newGlobalErrorWords = new Set(state.gameState.errorWords);
          newGlobalErrorWords.delete(kanjiWord);

          // Recalculate score based on reduced penalty
          const penaltyPerWord = 100 / state.gameState.allGameWords.length;
          const totalPenalty = newGlobalErrorWords.size * penaltyPerWord;
          const newScore = Math.max(0, 100 - totalPenalty);

          return {
            gameState: {
              ...state.gameState,
              errorWords: newGlobalErrorWords,
              score: Math.round(newScore),
            },
          };
        });
      }
      return wasInGlobal;
    } else {
      // Jika sectionState.errorWords ada isi (ada error di sesi saat ini),
      // maka tidak remove apapun
      return false;
    }
  },

  resetWordsWithErrors: () =>
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        errorWords: new Set(),
      },
    })),

  // Section Management Actions
  setCurrentSectionIndex: (index: number) =>
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        currentSectionIndex: index,
      },
    })),

  setAllSections: (sections: PairingWord[][]) => {
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        allSections: sections,
      },
    }));
  },

  moveToNextSection: () => {
    const {
      sectionState: { currentSectionIndex, allSections },
      loadSection,
    } = get();

    if (currentSectionIndex + 1 < allSections.length) {
      // Move to next section
      const nextIndex = currentSectionIndex + 1;
      set((state) => ({
        sectionState: {
          ...state.sectionState,
          currentSectionIndex: nextIndex,
        },
      }));
      loadSection();
      return true; // Successfully moved to next section
    } else {
      // Game complete
      return false; // No more sections
    }
  },

  resetSectionIndex: () =>
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        currentSectionIndex: 0,
      },
    })),

  // Game Initialization Actions
  initializeGame: (params: GameInitializationParams) => {
    const {
      lessonId,
      level,
      shouldResetSectionIndex = false,
      selectedKanjiIds,
      topicId,
    } = params;
    const gameData = getPairingGameData(
      lessonId,
      level,
      selectedKanjiIds,
      topicId
    );

    // Shuffle all words first for better randomness
    const shuffledWords = shuffleArrayUtil(gameData.words);

    // Get initial sections
    const sections = getSections(shuffledWords);
    const {
      setAllSections,
      resetGame,
      setAllGameWords,
      resetSectionIndex,
      loadSection,
    } = get();

    resetGame(gameData.totalWords);
    setAllSections(sections);

    // Store shuffled words for retry system
    setAllGameWords(shuffledWords);

    // Reset section index if needed (for restart)
    if (shouldResetSectionIndex) {
      resetSectionIndex();
    }

    // Load first section
    if (sections.length > 0) {
      loadSection();
    }
  },

  // Game Grid Actions
  loadSection: () => {
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        selectedCards: [],
        matchedPairs: new Set(),
        errorCards: new Set(),
      },
    }));
  },

  setAllGameWords: (allWords: PairingWord[]) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        allGameWords: allWords,
      },
    })),

  setSelectedCards: (cards: SelectedCard[]) =>
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        selectedCards: cards,
      },
    })),

  setMatchedPairs: (pairs: Set<string>) =>
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        matchedPairs: pairs,
      },
    })),

  setErrorCards: (errors: Set<string>) =>
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        errorCards: errors,
      },
    })),
  checkSectionComplete: () => {
    const {
      // sectionState: { matchedPairs, gameWords },
      sectionState: { matchedPairs, allSections },
    } = get();
    const totalSectionWords = allSections.reduce((acc, word) => {
      return acc + word.length;
    }, 0);
    return GameDataService.isSectionComplete(
      matchedPairs.size,
      // gameWords.length
      totalSectionWords
    );
  },

  // Retry System Implementation
  canRetry: () => {
    const {
      gameState: { errorWords },
      sectionState: { errorWords: sectionErrorWords },
    } = get();
    const allWrongWords = new Set([...errorWords, ...sectionErrorWords]);
    return allWrongWords.size > 0; // Can retry if there are any wrong words globally
  },

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

    // Generate retry words using service
    const retryWords = GameDataService.generateRetryWords(
      allGameWords,
      wrongWords
    );
    const retrySections = getSections(retryWords);
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        allSections: retrySections,
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
  },

  finishRetryMode: () => {
    const {
      gameState,
      sectionState: { errorWords: sectionErrorWords },
    } = get();

    // Merge current section wrong words to global (for next potential retry)
    const updatedGlobalErrorWords = new Set([
      ...gameState.errorWords,
      ...sectionErrorWords,
    ]);

    // Current score already reflects all penalties correctly
    let finalScore = gameState.score;

    set((state) => ({
      gameState: {
        ...state.gameState,
        isRetryMode: false,
        score: finalScore,
        errorWords: updatedGlobalErrorWords,
        isComplete: true,
      },
    }));
  },
}));
