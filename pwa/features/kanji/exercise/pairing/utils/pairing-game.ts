import { KanjiService, KanjiDetail } from "@/pwa/core/services/kanji";
import { PairingWord, GameSection } from "../types";
import { GameDataService } from "../services";

// Convert kanji details to pairing words
export const createPairingWords = (
  kanjiDetails: KanjiDetail[]
): PairingWord[] => {
  const words: PairingWord[] = [];

  kanjiDetails.forEach((kanji) => {
    // Use examples from kanji data, just add kanjiId
    kanji.examples.forEach((example) => {
      words.push({
        ...example,           // Spread all KanjiExample fields (id, word, furigana, romanji, meanings)
        kanjiId: kanji.id,    // Add parent kanji ID
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
    allKanjiDetails = KanjiService.getKanjiDetailsByTopicId(topicId, level);
  } else if (lessonId) {
    // Get kanji details by lesson ID
    allKanjiDetails = KanjiService.getKanjiDetailsByLessonId(lessonId, level);
  } else {
    allKanjiDetails = [];
  }

  // Filter kanji details if selectedKanjiIds is provided
  const kanjiDetails =
    selectedKanjiIds && selectedKanjiIds.length > 0
      ? allKanjiDetails.filter((kanji) => selectedKanjiIds.includes(kanji.id))
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
