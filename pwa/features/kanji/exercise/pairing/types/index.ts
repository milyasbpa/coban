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
  currentSection: number;
  totalSections: number;
  score: number;
}

export interface SelectedCard {
  id: string;
  type: "kanji" | "meaning";
  content: string;
  pairingWord?: PairingWord; // Optional reference to full PairingWord data
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