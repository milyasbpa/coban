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
  // Empty interface - all fields moved to semantic locations
  // Keep for backward compatibility during transition
}

export interface GameState {
  allGameWords: PairingWord[]; // Global master data - all words for the entire game
  isRetryMode: boolean; // Global retry mode state
  score: number; // Global computed score
  isComplete: boolean; // Global game completion state
  correctPairs: number; // Global correct pairs count
  errorWords: Set<string>; // Global error words for penalty calculation
}

export interface SectionState {
  currentSectionIndex: number;
  allSections: PairingWord[][];
  gameWords: PairingWord[]; // Current section words for UI rendering
  selectedCards: SelectedCard[]; // Current section UI interaction state
  matchedPairs: Set<string>; // Current section matched pairs
  errorCards: Set<string>; // Current section error cards
  errorWords: Set<string>; // Current section error words
}

export interface RetryState {
  // Empty interface - globalWordsWithErrors moved to gameState.errorWords
  // Keep for backward compatibility during transition
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