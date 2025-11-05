import { create } from "zustand";
import {
  getPairingGameData,
  getSections,
  shuffleArray as shuffleArrayUtil,
} from "../utils/pairing-game";
import {
  GameStats,
  SectionState,
  RetryState,
  GameGridState,
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
  sectionState: SectionState;
  retryState: RetryState;
  gameGridState: GameGridState;

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
}

export const usePairingGameStore = create<PairingGameState>((set, get) => ({
  // Core Game State
  gameStats: {
    totalWords: 0,
    correctPairs: 0,
    wrongAttempts: 0,
    uniqueWrongWords: 0,
    score: 100,
  },
  isGameComplete: false,
  wordsWithErrors: new Set(),

  // Grouped State Objects  
  sectionState: {
    currentSectionIndex: 0,
    allSections: [],
  },

  retryState: {
    isRetryMode: false,
    originalTotalWords: 0,
    allGameWords: [],
    globalWordsWithErrors: new Set(),
    currentBaseScore: 100,
  },

  gameGridState: {
    gameWords: [],
    selectedCards: [],
    matchedPairs: new Set(),
    errorCards: new Set(),
  },

  updateStats: (updates) =>
    set((state) => {
      const newStats = {
        ...state.gameStats,
        ...updates,
      };
      // Only recalculate score if not explicitly provided in updates
      if (!updates.hasOwnProperty("score")) {
        if (state.retryState.isRetryMode) {
          // During retry mode, maintain current score (will be handled by addWordError)
          newStats.score = state.gameStats.score;
        } else {
          // Normal mode: recalculate from scratch
          newStats.score = ScoreCalculatorService.calculateScore(newStats);
        }
      }
      return { gameStats: newStats };
    }),

  setGameComplete: (complete) => set({ isGameComplete: complete }),

  resetGame: (totalWords) =>
    set({
      gameStats: {
        totalWords,
        correctPairs: 0,
        wrongAttempts: 0,
        uniqueWrongWords: 0,
        score: 100,
      },
      isGameComplete: false,
      wordsWithErrors: new Set(),
      sectionState: {
        currentSectionIndex: 0,
        allSections: [],
      },
      retryState: {
        isRetryMode: false,
        originalTotalWords: 0,
        allGameWords: [],
        globalWordsWithErrors: new Set(),
        currentBaseScore: 100,
      },
      gameGridState: {
        gameWords: [],
        selectedCards: [],
        matchedPairs: new Set(),
        errorCards: new Set(),
      },
    }),

  calculateAndSetScore: () => {
    const {
      gameStats,
      retryState: { isRetryMode, originalTotalWords, globalWordsWithErrors },
      wordsWithErrors,
    } = get();

    let newScore;
    if (isRetryMode) {
      // During retry mode, calculate from global accumulative wrong words + current session wrong words
      const penaltyPerWord = 100 / originalTotalWords;
      const allCurrentWrongWords = new Set([
        ...globalWordsWithErrors,
        ...wordsWithErrors,
      ]);
      const totalUniqueWrongWords = allCurrentWrongWords.size;
      const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
      newScore = Math.max(0, 100 - totalPenalty);
    } else {
      // Normal mode: calculate from scratch
      newScore = ScoreCalculatorService.calculateScore(gameStats);
    }

    set((state) => ({
      gameStats: {
        ...state.gameStats,
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
        if (state.retryState.isRetryMode) {
          const penaltyPerWord = 100 / state.retryState.originalTotalWords;

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
              score: Math.round(newScore),
            },
          };
        }

        // Normal mode: Recalculate score immediately with new penalty
        const updatedStats = {
          ...state.gameStats,
          uniqueWrongWords: newUniqueWrongWords,
        };
        const newScore = ScoreCalculatorService.calculateScore(updatedStats);
        return {
          wordsWithErrors: newErrorSet,
          gameStats: {
            ...updatedStats,
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
          if (state.retryState.isRetryMode) {
            const penaltyPerWord = 100 / state.retryState.allGameWords.length;
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
            newScore = ScoreCalculatorService.calculateScore(updatedStats);
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
  setCurrentSectionIndex: (index) => 
    set((state) => ({
      sectionState: {
        ...state.sectionState,
        currentSectionIndex: index,
      },
    })),

  setAllSections: (sections) => {
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
  loadSection: (sectionWords) => {
    set((state) => ({
      gameGridState: {
        ...state.gameGridState,
        gameWords: sectionWords,
        selectedCards: [],
        matchedPairs: new Set(),
        errorCards: new Set(),
      },
    }));
  },

  setAllGameWords: (allWords) => 
    set((state) => ({
      retryState: {
        ...state.retryState,
        allGameWords: allWords,
      },
    })),

  setSelectedCards: (cards) => 
    set((state) => ({
      gameGridState: {
        ...state.gameGridState,
        selectedCards: cards,
      },
    })),

  setMatchedPairs: (pairs) => 
    set((state) => ({
      gameGridState: {
        ...state.gameGridState,
        matchedPairs: pairs,
      },
    })),

  setErrorCards: (errors) => 
    set((state) => ({
      gameGridState: {
        ...state.gameGridState,
        errorCards: errors,
      },
    })),

  checkSectionComplete: () => {
    const { gameGridState: { matchedPairs, gameWords } } = get();
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
      retryState: {
        ...state.retryState,
        isRetryMode: true,
        currentBaseScore: gameStats.score, // Store current score as base for retry
        globalWordsWithErrors: newGlobalWordsWithErrors, // Update global tracking
        originalTotalWords: gameStats.totalWords || state.retryState.originalTotalWords, // Set once, reuse
      },
      isGameComplete: false,
    }));
  },

  generateRetrySession: () => {
    const { retryState: { globalWordsWithErrors, allGameWords, currentBaseScore } } = get();
    const wrongWords = Array.from(globalWordsWithErrors);

    // Generate retry words using service
    const retryWords = GameDataService.generateRetryWords(
      allGameWords,
      wrongWords
    );
    set((state) => ({
      gameGridState: {
        ...state.gameGridState,
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
        totalWords: retryWords.length,
        score: currentBaseScore, // Start with current base score (accumulative)
      },
    }));
  },

  finishRetryMode: (retryResults: RetryResults) => {
    const { gameStats, retryState, wordsWithErrors } = get();

    // Merge current session wrong words to global (for next potential retry)
    const updatedGlobalWordsWithErrors = WordErrorService.mergeErrorSets(
      retryState.globalWordsWithErrors,
      wordsWithErrors
    );

    // Current score already reflects all penalties correctly
    let finalScore = gameStats.score;

    // Update currentBaseScore for potential next retry
    const newBaseScore = finalScore;

    set((state) => ({
      retryState: {
        ...state.retryState,
        isRetryMode: false,
        currentBaseScore: newBaseScore, // Update base score for next retry
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