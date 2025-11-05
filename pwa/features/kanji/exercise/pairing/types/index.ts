// Types untuk pairing game
export interface PairingWord {
  id: string;
  kanji: string;
  reading: string;
  meanings: {
    id: string;
    en: string;
  };
  furigana: string;
}

export interface GameStats {
  totalWords: number;
  correctPairs: number;
  wrongAttempts: number;
  uniqueWrongWords: number; // Track unique words yang pernah salah untuk penalty
  score: number;
}

export interface GameState {
  allGameWords: PairingWord[]; // Global master data - all words for the entire game
}

export interface SectionState {
  currentSectionIndex: number;
  allSections: PairingWord[][];
  gameWords: PairingWord[]; // Current section words for UI rendering
}

export interface RetryState {
  isRetryMode: boolean;
  originalTotalWords: number; // Store original total words for penalty calculation
  globalWordsWithErrors: Set<string>; // ALL words yang pernah salah sejak awal (accumulative)
  currentBaseScore: number; // Current base score untuk retry berikutnya
}

export interface GameGridState {
  selectedCards: SelectedCard[];
  matchedPairs: Set<string>;
  errorCards: Set<string>;
}

export interface SelectedCard extends PairingWord {
  type: "kanji" | "meaning";
}

export interface GameSection {
  sectionIndex: number;
  words: PairingWord[];
  completed: boolean;
}

export interface RetryResults {
  correctCount: number;
}

export interface GameInitializationParams {
  lessonId: number | null;
  level: string;
  shouldResetSectionIndex?: boolean;
  selectedKanjiIds?: number[];
  topicId?: string;
}