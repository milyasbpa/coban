import {
  getKanjiDetailsByLessonId,
  getKanjiDetailsByTopicId,
  KanjiDetail,
} from "@/pwa/features/kanji/lesson/utils/kanji";
import { PairingWord, GameSection } from "../types";
import { GameDataService } from "../services";

// Convert kanji details to pairing words
export const createPairingWords = (
  kanjiDetails: KanjiDetail[]
): PairingWord[] => {
  const words: PairingWord[] = [];

  kanjiDetails.forEach((kanji) => {
    // Use examples from kanji data
    kanji.examples.forEach((example, index) => {
      words.push({
        id: `${kanji.id}-${example.id}`, // Use example.id from new structure
        kanji: example.word,
        reading: example.romanji,
        meanings: example.meanings, // Use new meanings structure
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

// Shuffle array function - delegated to service
export const shuffleArray = <T>(array: T[]): T[] => {
  return GameDataService.shuffleArray(array);
};

// Get pairing game data by lesson
export const getPairingGameData = (
  lessonId: number | null, 
  level: string, 
  selectedKanjiIds?: number[],
  topicId?: string
) => {
  let allKanjiDetails: KanjiDetail[];
  
  if (topicId) {
    // Get kanji details by topic ID
    allKanjiDetails = getKanjiDetailsByTopicId(topicId, level);
  } else if (lessonId) {
    // Get kanji details by lesson ID
    allKanjiDetails = getKanjiDetailsByLessonId(lessonId, level);
  } else {
    allKanjiDetails = [];
  }
  
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
  };
};

// get sections utility - delegated to service
export const getSections = (shuffledWords: PairingWord[]) => {
  return GameDataService.createSections(shuffledWords, 5);
};
