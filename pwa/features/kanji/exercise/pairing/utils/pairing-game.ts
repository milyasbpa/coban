import { getKanjiDetailsByLessonId, KanjiDetail } from "@/pwa/features/kanji/lesson/utils/kanji";

export interface PairingWord {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  furigana: string;
}

export interface GameSection {
  sectionIndex: number;
  words: PairingWord[];
  completed: boolean;
}

export interface GameStats {
  totalWords: number;
  correctPairs: number;
  wrongAttempts: number;
  currentSection: number;
  totalSections: number;
  score: number;
}

// Convert kanji details to pairing words
export const createPairingWords = (kanjiDetails: KanjiDetail[]): PairingWord[] => {
  const words: PairingWord[] = [];
  
  kanjiDetails.forEach((kanji) => {
    // Use examples from kanji data
    kanji.examples.forEach((example, index) => {
      words.push({
        id: `${kanji.id}-${index}`,
        kanji: example.word,
        reading: example.romanji,
        meaning: example.meaning_id,
        furigana: example.furigana,
      });
    });
  });
  
  return words;
};

// Split words into sections of 5
export const createGameSections = (words: PairingWord[]): GameSection[] => {
  const sections: GameSection[] = [];
  const wordsPerSection = 5;
  
  for (let i = 0; i < words.length; i += wordsPerSection) {
    const sectionWords = words.slice(i, i + wordsPerSection);
    sections.push({
      sectionIndex: sections.length,
      words: sectionWords,
      completed: false,
    });
  }
  
  return sections;
};

// Shuffle array function
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Calculate score based on performance
export const calculateScore = (stats: GameStats): number => {
  const accuracy = stats.correctPairs / (stats.correctPairs + stats.wrongAttempts);
  return Math.round(accuracy * 100);
};

// Get pairing game data by lesson
export const getPairingGameData = (lessonId: number, level: string) => {
  const kanjiDetails = getKanjiDetailsByLessonId(lessonId, level);
  const words = createPairingWords(kanjiDetails);
  const sections = createGameSections(words);
  
  return {
    words,
    sections,
    totalWords: words.length,
    totalSections: sections.length,
  };
};