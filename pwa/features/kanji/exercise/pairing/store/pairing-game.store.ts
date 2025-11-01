import { create } from 'zustand';

export interface GameStats {
  totalWords: number;
  correctPairs: number;
  wrongAttempts: number;
  uniqueWrongWords: number; // Track unique words yang pernah salah untuk penalty
  currentSection: number;
  totalSections: number;
  score: number;
}

interface SelectedCard {
  id: string;
  type: "kanji" | "meaning";
  content: string;
}

interface PairingGameState {
  gameStats: GameStats;
  isGameComplete: boolean;
  wordsWithErrors: Set<string>; // Track words yang sudah pernah salah dalam session ini saja
  
  // Retry System - Redesigned for Recursive Support
  isRetryMode: boolean;
  originalTotalWords: number; // Store original total words for penalty calculation
  allGameWords: any[]; // Store all words for decoy selection
  
  // Global Accumulative Tracking (never reset during retry)
  globalWordsWithErrors: Set<string>; // ALL words yang pernah salah sejak awal (accumulative)
  currentBaseScore: number; // Current base score untuk retry berikutnya
  
  // Game Grid State
  gameWords: any[]; // PairingWord[]
  shuffledKanji: string[];
  selectedCards: SelectedCard[];
  matchedPairs: Set<string>;
  errorCards: Set<string>;
  
  // Actions
  updateStats: (stats: Partial<GameStats>) => void;
  setGameComplete: (complete: boolean) => void;
  resetGame: (totalWords: number, totalSections: number) => void;
  calculateAndSetScore: () => void;
  addWordError: (word: string) => boolean; // Return true jika ini error pertama untuk word ini
  resetWordsWithErrors: () => void;
  
  // Retry Actions
  startRetryMode: () => void;
  generateRetrySession: () => void;
  finishRetryMode: (retryResults: { correctCount: number }) => void;
  canRetry: () => boolean;
  
  // Game Grid Actions
  loadSection: (sectionWords: any[]) => void;
  setAllGameWords: (allWords: any[]) => void;
  setSelectedCards: (cards: SelectedCard[]) => void;
  setMatchedPairs: (pairs: Set<string>) => void;
  setErrorCards: (errors: Set<string>) => void;
  checkSectionComplete: () => boolean;
}

// Helper function untuk menghitung score (berkurang proporsional berdasarkan unique wrong words)
const calculateScore = (stats: GameStats): number => {
  if (stats.totalWords === 0) return 100;
  
  // Sistem penalty: Setiap kanji word yang salah (pertama kali) mengurangi score
  // Penalty proporsional = 100 / total words, jadi jika 5 words dan 1 salah = -20 poin
  const penaltyPerUniqueWrongWord = 100 / stats.totalWords;
  const totalPenalty = stats.uniqueWrongWords * penaltyPerUniqueWrongWord;
  const newScore = 100 - totalPenalty;
  
  // Bulatkan dan clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(newScore)));
};

export const usePairingGameStore = create<PairingGameState>((set, get) => ({
  gameStats: {
    totalWords: 0,
    correctPairs: 0,
    wrongAttempts: 0,
    uniqueWrongWords: 0,
    currentSection: 1,
    totalSections: 1,
    score: 100,
  },
  isGameComplete: false,
  wordsWithErrors: new Set(),
  
  // Retry System - Redesigned
  isRetryMode: false,
  originalTotalWords: 0,
  allGameWords: [],
  
  // Global Accumulative Tracking
  globalWordsWithErrors: new Set(),
  currentBaseScore: 100,
  
  // Game Grid State
  gameWords: [],
  shuffledKanji: [],
  selectedCards: [],
  matchedPairs: new Set(),
  errorCards: new Set(),
  
  updateStats: (updates) => set((state) => {
    const newStats = {
      ...state.gameStats,
      ...updates,
    };
    // Only recalculate score if not explicitly provided in updates
    if (!updates.hasOwnProperty('score')) {
      if (state.isRetryMode) {
        // During retry mode, maintain current score (will be handled by addWordError)
        newStats.score = state.gameStats.score;
      } else {
        // Normal mode: recalculate from scratch
        newStats.score = calculateScore(newStats);
      }
    }
    return { gameStats: newStats };
  }),
  
  setGameComplete: (complete) => set({ isGameComplete: complete }),
  
  resetGame: (totalWords, totalSections) => set({
    gameStats: {
      totalWords,
      correctPairs: 0,
      wrongAttempts: 0,
      uniqueWrongWords: 0,
      currentSection: 1,
      totalSections,
      score: 100,
    },
    isGameComplete: false,
    wordsWithErrors: new Set(),
    // Reset retry system
    isRetryMode: false,
    originalTotalWords: 0,
    allGameWords: [],
    globalWordsWithErrors: new Set(),
    currentBaseScore: 100,
    // Reset game grid state
    gameWords: [],
    shuffledKanji: [],
    selectedCards: [],
    matchedPairs: new Set(),
    errorCards: new Set(),
  }),
  
  calculateAndSetScore: () => {
    const { gameStats, isRetryMode, originalTotalWords, globalWordsWithErrors, wordsWithErrors } = get();
    
    let newScore;
    if (isRetryMode) {
      // During retry mode, calculate from global accumulative wrong words + current session wrong words
      const penaltyPerWord = 100 / originalTotalWords;
      const allCurrentWrongWords = new Set([
        ...globalWordsWithErrors,
        ...wordsWithErrors
      ]);
      const totalUniqueWrongWords = allCurrentWrongWords.size;
      const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
      newScore = Math.max(0, 100 - totalPenalty);
    } else {
      // Normal mode: calculate from scratch
      newScore = calculateScore(gameStats);
    }
    
    set((state) => ({
      gameStats: {
        ...state.gameStats,
        score: Math.round(newScore),
      }
    }));
  },
  
  addWordError: (kanjiWord: string) => {
    const { wordsWithErrors, isRetryMode } = get();
    const isFirstError = !wordsWithErrors.has(kanjiWord);
    
    // Only penalize score on first error for this specific kanji word
    if (isFirstError) {
      set((state) => {
        const newWordsWithErrors = new Set([...state.wordsWithErrors, kanjiWord]);
        const newUniqueWrongWords = state.gameStats.uniqueWrongWords + 1;
        
        // During retry mode, calculate penalty from global accumulative base
        if (state.isRetryMode) {
          const penaltyPerWord = 100 / state.originalTotalWords;
          
          // Calculate total unique wrong words: global + current session
          const allCurrentWrongWords = new Set([
            ...state.globalWordsWithErrors, // All words wrong sejak awal
            ...newWordsWithErrors // Current retry session wrong words
          ]);
          
          const totalUniqueWrongWords = allCurrentWrongWords.size;
          const totalPenalty = totalUniqueWrongWords * penaltyPerWord;
          const newScore = Math.max(0, 100 - totalPenalty);
          
          return {
            wordsWithErrors: newWordsWithErrors,
            gameStats: {
              ...state.gameStats,
              uniqueWrongWords: newUniqueWrongWords,
              score: Math.round(newScore),
            }
          };
        }
        
        // Normal mode: Recalculate score immediately with new penalty
        const updatedStats = {
          ...state.gameStats,
          uniqueWrongWords: newUniqueWrongWords,
        };
        const newScore = calculateScore(updatedStats);
        
        return {
          wordsWithErrors: newWordsWithErrors,
          gameStats: {
            ...updatedStats,
            score: newScore,
          }
        };
      });
    }
    
    return isFirstError;
  },
  
  resetWordsWithErrors: () => set((state) => ({
    wordsWithErrors: new Set(),
    gameStats: {
      ...state.gameStats,
      uniqueWrongWords: 0,
    }
  })),
  
  // Game Grid Actions
  loadSection: (sectionWords) => {
    const shuffleArray = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    set({
      gameWords: sectionWords,
      shuffledKanji: shuffleArray(sectionWords.map((w: any) => w.kanji)),
      selectedCards: [],
      matchedPairs: new Set(),
      errorCards: new Set(),
    });
  },
  
  setAllGameWords: (allWords) => set({ allGameWords: allWords }),
  
  setSelectedCards: (cards) => set({ selectedCards: cards }),
  
  setMatchedPairs: (pairs) => set({ matchedPairs: pairs }),
  
  setErrorCards: (errors) => set({ errorCards: errors }),
  
  checkSectionComplete: () => {
    const { matchedPairs, gameWords } = get();
    return matchedPairs.size >= gameWords.length * 2;
  },

  // Retry System Implementation
  canRetry: () => {
    const { globalWordsWithErrors, wordsWithErrors } = get();
    const allWrongWords = new Set([...globalWordsWithErrors, ...wordsWithErrors]);
    return allWrongWords.size > 0; // Can retry if there are any wrong words globally
  },

  startRetryMode: () => {
    const { gameStats, wordsWithErrors, globalWordsWithErrors } = get();
    
    // Merge current session wrong words ke global tracking
    const newGlobalWordsWithErrors = new Set([
      ...globalWordsWithErrors,
      ...wordsWithErrors
    ]);
    
    set({
      isRetryMode: true,
      isGameComplete: false,
      currentBaseScore: gameStats.score, // Store current score as base for retry
      globalWordsWithErrors: newGlobalWordsWithErrors, // Update global tracking
      originalTotalWords: gameStats.totalWords || get().originalTotalWords, // Set once, reuse
    });
  },

  generateRetrySession: () => {
    const { globalWordsWithErrors, allGameWords, currentBaseScore } = get();
    const wrongWords = Array.from(globalWordsWithErrors);
    
    // Find wrong word data
    const wrongWordData = allGameWords.filter(w => wrongWords.includes(w.kanji));
    
    // Generate retry session based on wrong words count
    let retryWords = [...wrongWordData];
    
    if (wrongWords.length === 1) {
      // Add 1 decoy for single wrong word
      const correctWords = allGameWords.filter(w => !wrongWords.includes(w.kanji));
      if (correctWords.length > 0) {
        const randomDecoy = correctWords[Math.floor(Math.random() * correctWords.length)];
        retryWords.push(randomDecoy);
      }
    }
    
    // Shuffle and load retry session
    const shuffleArray = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    set({
      gameWords: retryWords,
      shuffledKanji: shuffleArray(retryWords.map(w => w.kanji)),
      selectedCards: [],
      matchedPairs: new Set(),
      errorCards: new Set(),
      wordsWithErrors: new Set(), // Reset current session tracking
      gameStats: {
        ...get().gameStats,
        correctPairs: 0,
        wrongAttempts: 0,
        uniqueWrongWords: 0,
        totalWords: retryWords.length,
        score: currentBaseScore, // Start with current base score (accumulative)
      }
    });
  },

  finishRetryMode: (retryResults: { correctCount: number }) => {
    const { 
      gameStats,
      originalTotalWords,
      globalWordsWithErrors,
      wordsWithErrors 
    } = get();
    
    // Merge current session wrong words to global (for next potential retry)
    const updatedGlobalWordsWithErrors = new Set([
      ...globalWordsWithErrors,
      ...wordsWithErrors
    ]);
    
    // Current score already reflects all penalties correctly
    let finalScore = gameStats.score;
    
    // Update currentBaseScore for potential next retry
    const newBaseScore = finalScore;
    
    console.log('FinishRetryMode Debug:', {
      currentScore: gameStats.score,
      globalWordsWithErrors: Array.from(globalWordsWithErrors),
      sessionWordsWithErrors: Array.from(wordsWithErrors),
      updatedGlobalWordsWithErrors: Array.from(updatedGlobalWordsWithErrors),
      retryResults,
      finalScore
    });
    
    set((state) => ({
      isRetryMode: false,
      isGameComplete: true,
      currentBaseScore: newBaseScore, // Update base score for next retry
      globalWordsWithErrors: updatedGlobalWordsWithErrors, // Merge session errors to global
      gameStats: {
        ...state.gameStats,
        score: Math.max(0, Math.min(100, Math.round(finalScore))),
      }
    }));
  },
}));