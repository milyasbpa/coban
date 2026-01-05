import { KanjiExample } from "@/pwa/core/services/kanji";

// Types untuk pairing game
export interface PairingWord extends KanjiExample {
  kanjiId: number;     // Parent kanji ID for grouping and scoring
  readingType: 'kun' | 'on' | 'exception'; // Reading type for uniqueness
  readingId: number;   // Reading ID within type for uniqueness
  // Inherited from KanjiExample:
  // - id: number (example ID for Firestore)
  // - word: string
  // - furigana: string
  // romanji: string
  // - meanings: { id: string; en: string }
}

// Helper function to get composite ID for UI keys and matching
// Uses kanjiId-readingType-readingId-exampleId to ensure uniqueness
export const getCompositeId = (word: PairingWord): string => {
  return `${word.kanjiId}-${word.readingType}-${word.readingId}-${word.id}`;
};

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
  allSections: PairingWord[][]; // Section words in session (normal and retry mode)
  selectedCards: SelectedCard[]; // Current section UI interaction state
  matchedPairs: Set<string>; // Current section matched pairs
  errorCards: Set<string>; // Current section error cards
  errorWords: Set<string>; // Current section error words
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
}
