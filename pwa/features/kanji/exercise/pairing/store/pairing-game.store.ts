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
  
  // Game Grid Actions
  loadSection: (sectionWords: any[]) => void;
  setSelectedCards: (cards: SelectedCard[]) => void;
  setMatchedPairs: (pairs: Set<string>) => void;
  setErrorCards: (errors: Set<string>) => void;
  checkSectionComplete: () => boolean;
}

// Helper function untuk menghitung score (berkurang proporsional berdasarkan unique wrong words)
const calculateScore = (stats: GameStats): number => {
  if (stats.totalWords === 0) return 100;
  
  // Penalty proporsional berdasarkan unique wrong words: 100 dibagi jumlah total kata
  const penaltyPerUniqueWrongWord = 100 / stats.totalWords;
  const newScore = 100 - (stats.uniqueWrongWords * penaltyPerUniqueWrongWord);
  
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
    // Recalculate score whenever stats are updated
    newStats.score = calculateScore(newStats);
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
  
  addWordError: (word: string) => {
    const { wordsWithErrors } = get();
    const isFirstError = !wordsWithErrors.has(word);
    
    if (isFirstError) {
      set((state) => ({
        wordsWithErrors: new Set([...state.wordsWithErrors, word]),
        gameStats: {
          ...state.gameStats,
          uniqueWrongWords: state.gameStats.uniqueWrongWords + 1,
        }
      }));
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
  
  setSelectedCards: (cards) => set({ selectedCards: cards }),
  
  setMatchedPairs: (pairs) => set({ matchedPairs: pairs }),
  
  setErrorCards: (errors) => set({ errorCards: errors }),
  
  checkSectionComplete: () => {
    const { matchedPairs, gameWords } = get();
    return matchedPairs.size >= gameWords.length * 2;
  },
}));