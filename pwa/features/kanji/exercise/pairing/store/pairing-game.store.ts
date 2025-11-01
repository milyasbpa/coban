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
  wordsWithErrors: Set<string>; // Track words yang sudah pernah salah
  
  // Retry System
  isRetryMode: boolean;
  originalScore: number;
  originalWordsWithErrors: Set<string>; // Words that were wrong in original game
  allGameWords: any[]; // Store all words for decoy selection
  
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
  
  // Retry System
  isRetryMode: false,
  originalScore: 100,
  originalWordsWithErrors: new Set(),
  allGameWords: [],
  
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
      newStats.score = calculateScore(newStats);
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
    originalScore: 100,
    originalWordsWithErrors: new Set(),
    allGameWords: [],
    // Reset game grid state
    gameWords: [],
    shuffledKanji: [],
    selectedCards: [],
    matchedPairs: new Set(),
    errorCards: new Set(),
  }),
  
  calculateAndSetScore: () => {
    const { gameStats } = get();
    const newScore = calculateScore(gameStats);
    set((state) => ({
      gameStats: {
        ...state.gameStats,
        score: newScore,
      }
    }));
  },
  
  addWordError: (kanjiWord: string) => {
    const { wordsWithErrors } = get();
    const isFirstError = !wordsWithErrors.has(kanjiWord);
    
    // Only penalize score on first error for this specific kanji word
    if (isFirstError) {
      set((state) => {
        const newWordsWithErrors = new Set([...state.wordsWithErrors, kanjiWord]);
        const newUniqueWrongWords = state.gameStats.uniqueWrongWords + 1;
        
        // Recalculate score immediately with new penalty
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
    const { wordsWithErrors } = get();
    return wordsWithErrors.size > 0; // Can retry if there are any wrong words
  },

  startRetryMode: () => {
    const { gameStats, wordsWithErrors, allGameWords } = get();
    set({
      isRetryMode: true,
      isGameComplete: false, // ✅ Reset game complete state
      originalScore: gameStats.score,
      originalWordsWithErrors: new Set([...wordsWithErrors]),
    });
  },

  generateRetrySession: () => {
    const { originalWordsWithErrors, allGameWords } = get();
    const wrongWords = Array.from(originalWordsWithErrors);
    
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
      wordsWithErrors: new Set(), // Reset for retry session
      gameStats: {
        ...get().gameStats,
        correctPairs: 0,
        wrongAttempts: 0,
        uniqueWrongWords: 0,
        totalWords: retryWords.length,
      }
    });
  },

  finishRetryMode: (retryResults: { correctCount: number }) => {
    const { originalScore, originalWordsWithErrors, gameStats } = get();
    const originalWrongCount = originalWordsWithErrors.size;
    const totalOriginalWords = gameStats.totalWords;
    
    // Calculate bonus: how many originally wrong words were corrected
    const maxPossibleBonus = (originalWrongCount / totalOriginalWords) * 100;
    const correctionRatio = retryResults.correctCount / originalWrongCount;
    const bonusPoints = maxPossibleBonus * correctionRatio;
    
    const finalScore = Math.min(100, Math.round(originalScore + bonusPoints));
    
    set((state) => ({
      isRetryMode: false,
      isGameComplete: true, // ✅ Mark game as complete after retry
      gameStats: {
        ...state.gameStats,
        score: finalScore,
      }
    }));
  },
}));