import { create } from "zustand";
import {
  getPairingGameData,
  getSections,
  shuffleArray as shuffleArrayUtil,
} from "../utils/pairing-game";
import {
  GameStats,
  GameState,
  SectionState,
  RetryState,
  PairingWord,
  SelectedCard,
  RetryResults,
  GameInitializationParams,
} from "../types";
import {
  ScoreCalculatorService,
  GameDataService,
  WordErrorService,
} from "../services";

interface PairingGameState {
  // Core Game State
  gameStats: GameStats;
  isGameComplete: boolean;
  wordsWithErrors: Set<string>; // Track words yang sudah pernah salah dalam session ini saja

  // Grouped State Objects
  gameState: GameState;
  sectionState: SectionState;
  retryState: RetryState;

  // Actions
  updateStats: (stats: Partial<GameStats>) => void;
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
  loadSection: (sectionWords: PairingWord[]) => void;
  setAllGameWords: (allWords: PairingWord[]) => void;
  setSelectedCards: (cards: SelectedCard[]) => void;
  setMatchedPairs: (pairs: Set<string>) => void;
  setErrorCards: (errors: Set<string>) => void;
  checkSectionComplete: () => boolean;

  // Computed Functions
  getGameTotalWords: () => number;
  getSectionTotalWords: () => number;
}

export const usePairingGameStore = create<PairingGameState>((set, get) => ({
  // Core Game State
  gameStats: {
    correctPairs: 0,
    wrongAttempts: 0,
    uniqueWrongWords: 0,
  },
  isGameComplete: false,
  wordsWithErrors: new Set(),

  // Grouped State Objects
  gameState: {
    allGameWords: [],
    isRetryMode: false,
    score: 100,
  },
  sectionState: {
    currentSectionIndex: 0,
    allSections: [],
    gameWords: [],
    selectedCards: [],
    matchedPairs: new Set<string>(),
    errorCards: new Set<string>(),
  },
  retryState: {
    globalWordsWithErrors: new Set<string>(),
  },

  // Computed functions
  getGameTotalWords: () => get().gameState.allGameWords.length,
  getSectionTotalWords: () => get().sectionState.gameWords.length,

  updateStats: (updates: Partial<GameStats>) =>
    set((state) => {
      const newStats = {
        ...state.gameStats,
        ...updates,
      };
      return { gameStats: newStats };
    }),

  setGameComplete: (complete: boolean) => set({ isGameComplete: complete }),

  resetGame: (totalWords: number) =>
    set({
      gameStats: {
        correctPairs: 0,
        wrongAttempts: 0,
        uniqueWrongWords: 0,
      },
      isGameComplete: false,
      wordsWithErrors: new Set(),
      gameState: {
        allGameWords: [],
        isRetryMode: false,
        score: 100,
      },
      sectionState: {
        currentSectionIndex: 0,
        allSections: [],
        gameWords: [],
        selectedCards: [],
        matchedPairs: new Set<string>(),
        errorCards: new Set<string>(),
      },
      retryState: {
        globalWordsWithErrors: new Set(),
      },
    }),

  calculateAndSetScore: () => {
    const {
      gameStats,
      gameState: { isRetryMode, score, allGameWords },
      retryState: { globalWordsWithErrors },
      wordsWithErrors,
    } = get();

    let newScore;
    if (isRetryMode) {
      // During retry mode, calculate from global accumulative wrong words + current session wrong words
      const penaltyPerWord = 100 / allGameWords.length;
      const allCurrentWrongWords = new Set([
        ...globalWordsWithErrors,
        ...wordsWithErrors,
      ]);
      const totalUniqueWrongWords = allCurrentWrongWords.size;
      const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
      newScore = Math.max(0, 100 - totalPenalty);
    } else {
      // Normal mode: calculate from scratch
      newScore = ScoreCalculatorService.calculateScore(gameStats, allGameWords.length);
    }

    set((state) => ({
      gameState: {
        ...state.gameState,
        score: Math.round(newScore),
      },
    }));
  },

  addWordError: (kanjiWord: string) => {
    const { wordsWithErrors, retryState } = get();
    const { newErrorSet, isFirstError } = WordErrorService.addWordError(
      wordsWithErrors,
      kanjiWord
    );

    // Only penalize score on first error for this specific kanji word
    if (isFirstError) {
      set((state) => {
        const newUniqueWrongWords = state.gameStats.uniqueWrongWords + 1;

        // During retry mode, calculate penalty from global accumulative base
        if (state.gameState.isRetryMode) {
          const penaltyPerWord = 100 / state.gameState.allGameWords.length;

          // Calculate total unique wrong words: global + current session
          const allCurrentWrongWords = WordErrorService.getAllWrongWords(
            state.retryState.globalWordsWithErrors,
            newErrorSet
          );

          const totalUniqueWrongWords = allCurrentWrongWords.size;
          const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
          const newScore = Math.max(0, 100 - totalPenalty);

          return {
            wordsWithErrors: newErrorSet,
            gameStats: {
              ...state.gameStats,
              uniqueWrongWords: newUniqueWrongWords,
            },
            gameState: {
              ...state.gameState,
              score: Math.round(newScore),
            },
          };
        }

        // Normal mode: Recalculate score immediately with new penalty
        const updatedStats = {
          ...state.gameStats,
          uniqueWrongWords: newUniqueWrongWords,
        };
        const newScore = ScoreCalculatorService.calculateScore(updatedStats, state.gameState.allGameWords.length);
        return {
          wordsWithErrors: newErrorSet,
          gameStats: {
            ...updatedStats,
          },
          gameState: {
            ...state.gameState,
            score: newScore,
          },
        };
      });
    }

    return isFirstError;
  },

  removeWordError: (kanjiWord: string) => {
    const { wordsWithErrors, retryState } = get();

    // Jika wordsWithErrors kosong (tidak ada error di sesi saat ini),
    // maka remove dari globalWordsWithErrors
    if (wordsWithErrors.size === 0) {
      const wasInGlobal = retryState.globalWordsWithErrors.has(kanjiWord);
      if (wasInGlobal) {
        set((state) => {
          const { newErrorSet: newGlobalWordsWithErrors } =
            WordErrorService.removeWordError(
              state.retryState.globalWordsWithErrors,
              kanjiWord
            );

          // Recalculate score based on reduced penalty
          let newScore;
          if (state.gameState.isRetryMode) {
            const penaltyPerWord = 100 / state.gameState.allGameWords.length;
            const totalUniqueWrongWords = newGlobalWordsWithErrors.size;
            const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
            newScore = Math.max(0, 100 - totalPenalty);
          } else {
            // Normal mode: recalculate from current stats minus this word
            const updatedStats = {
              ...state.gameStats,
              uniqueWrongWords: Math.max(
                0,
                state.gameStats.uniqueWrongWords - 1
              ),
            };
            newScore = ScoreCalculatorService.calculateScore(updatedStats, state.gameState.allGameWords.length);
          }
          return {
            retryState: {
              ...state.retryState,
              globalWordsWithErrors: newGlobalWordsWithErrors,
            },
            gameStats: {
              ...state.gameStats,
              uniqueWrongWords: Math.max(
                0,
                state.gameStats.uniqueWrongWords - 1
              ),
              score: Math.round(newScore),
            },
          };
        });
      }
      return wasInGlobal;
    } else {
      // Jika wordsWithErrors ada isi (ada error di sesi saat ini),
      // maka tidak remove apapun
      return false;
    }
  },

  resetWordsWithErrors: () =>
    set((state) => ({
      wordsWithErrors: new Set(),
      gameStats: {
        ...state.gameStats,
        uniqueWrongWords: 0,
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
      updateStats,
      gameStats,
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
      loadSection(allSections[nextIndex]);
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
      loadSection(sections[0]);
    }
  },

  // Game Grid Actions
  loadSection: (sectionWords: PairingWord[]) => {
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
    })),  checkSectionComplete: () => {
    const { sectionState: { matchedPairs, gameWords } } = get();
    return GameDataService.isSectionComplete(
      matchedPairs.size,
      gameWords.length
    );
  },

  // Retry System Implementation
  canRetry: () => {
    const { retryState: { globalWordsWithErrors }, wordsWithErrors } = get();
    const allWrongWords = WordErrorService.getAllWrongWords(
      globalWordsWithErrors,
      wordsWithErrors
    );
    return allWrongWords.size > 0; // Can retry if there are any wrong words globally
  },

  startRetryMode: () => {
    const { gameStats, wordsWithErrors, retryState } = get();

    // Merge current session wrong words ke global tracking
    const newGlobalWordsWithErrors = WordErrorService.mergeErrorSets(
      retryState.globalWordsWithErrors,
      wordsWithErrors
    );

    set((state) => ({
      gameState: {
        ...state.gameState,
        isRetryMode: true,
      },
      retryState: {
        ...state.retryState,
        globalWordsWithErrors: newGlobalWordsWithErrors, // Update global tracking
      },
      isGameComplete: false,
    }));
  },

  generateRetrySession: () => {
    const { retryState: { globalWordsWithErrors }, gameState: { allGameWords, score } } = get();
    const wrongWords = Array.from(globalWordsWithErrors);

    // Generate retry words using service
    const retryWords = GameDataService.generateRetryWords(
      allGameWords,
      wrongWords
    );
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        gameWords: retryWords,
        selectedCards: [],
        matchedPairs: new Set(),
        errorCards: new Set(),
      },
      wordsWithErrors: new Set(), // Reset current session tracking
      gameStats: {
        ...state.gameStats,
        correctPairs: 0,
        wrongAttempts: 0,
        uniqueWrongWords: 0,
      },
    }));
  },

  finishRetryMode: (retryResults: RetryResults) => {
    const { gameState, retryState, wordsWithErrors } = get();

    // Merge current session wrong words to global (for next potential retry)
    const updatedGlobalWordsWithErrors = WordErrorService.mergeErrorSets(
      retryState.globalWordsWithErrors,
      wordsWithErrors
    );

    // Current score already reflects all penalties correctly
    let finalScore = gameState.score;

    set((state) => ({
      gameState: {
        ...state.gameState,
        isRetryMode: false,
        score: finalScore,
      },
      retryState: {
        ...state.retryState,
        globalWordsWithErrors: updatedGlobalWordsWithErrors, // Merge session errors to global
      },
      isGameComplete: true,
      gameStats: {
        ...state.gameStats,
        score: Math.max(0, Math.min(100, Math.round(finalScore))),
      },
    }));
  },
}));