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
  correctPairs: number;
  wrongAttempts: number;
  uniqueWrongWords: number; // Track unique words yang pernah salah untuk penalty
}

export interface GameState {
  allGameWords: PairingWord[]; // Global master data - all words for the entire game
  isRetryMode: boolean; // Global retry mode state
  score: number; // Global computed score
}

export interface SectionState {
  currentSectionIndex: number;
  allSections: PairingWord[][];
  gameWords: PairingWord[]; // Current section words for UI rendering
  selectedCards: SelectedCard[]; // Current section UI interaction state
  matchedPairs: Set<string>; // Current section matched pairs
  errorCards: Set<string>; // Current section error cards
}

export interface RetryState {
  globalWordsWithErrors: Set<string>; // ALL words yang pernah salah sejak awal (accumulative)
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