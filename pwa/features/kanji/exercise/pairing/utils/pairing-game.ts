import {
  getKanjiDetailsByLessonId,
  KanjiDetail,
} from "@/pwa/features/kanji/lesson/utils/kanji";
import { GameStats } from "../store/pairing-game.store";

export interface PairingWord {
  id: string;
  kanji: string;
  reading: string;
  meaning_id: string;
  meaning_en: string;
  furigana: string;
}

export interface GameSection {
  sectionIndex: number;
  words: PairingWord[];
  completed: boolean;
}

// Convert kanji details to pairing words
export const createPairingWords = (
  kanjiDetails: KanjiDetail[]
): PairingWord[] => {
  const words: PairingWord[] = [];

  kanjiDetails.forEach((kanji) => {
    // Use examples from kanji data
    kanji.examples.forEach((example, index) => {
      words.push({
        id: `${kanji.id}-${index}`,
        kanji: example.word,
        reading: example.romanji,
        meaning_id: example.meaning_id,
        meaning_en: example.meaning_en,
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
  const accuracy =
    stats.correctPairs / (stats.correctPairs + stats.wrongAttempts);
  return Math.round(accuracy * 100);
};

// Get pairing game data by lesson
export const getPairingGameData = (
  lessonId: number, 
  level: string, 
  selectedKanjiIds?: number[]
) => {
  const allKanjiDetails = getKanjiDetailsByLessonId(lessonId, level);
  
  // Filter kanji details if selectedKanjiIds is provided
  const kanjiDetails = selectedKanjiIds && selectedKanjiIds.length > 0
    ? allKanjiDetails.filter(kanji => selectedKanjiIds.includes(kanji.id))
    : allKanjiDetails;
  
  // NOTE: for debugging purpose don't remove when it's uncomment
  // const words = createPairingWords(kanjiDetails).slice(0, 3);
  const words = createPairingWords(kanjiDetails);
  const sections = createGameSections(words);
  return {
    words,
    sections,
    totalWords: words.length,
    totalSections: sections.length,
  };
};

// get sections utility
export const getSections = (shuffledWords: PairingWord[]) => {
  const sections = [];
  // Split shuffled words into sections of 5
  for (let i = 0; i < shuffledWords.length; i += 5) {
    sections.push(shuffledWords.slice(i, i + 5));
  }
  return sections;
};
