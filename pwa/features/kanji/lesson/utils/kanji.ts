import n5KanjiData from "@/data/n5/kanji/kanji.json";
import n4KanjiData from "@/data/n4/kanji/kanji.json";

interface KanjiReading {
  furigana: string;
  romanji: string;
}

interface KanjiExample {
  word: string;
  furigana: string;
  romanji: string;
  meaning_id: string;
  meaning_en: string;
}

export interface KanjiDetail {
  id: number;
  character: string;
  strokes: number;
  readings: {
    kun: KanjiReading[];
    on: KanjiReading[];
  };
  meanings: {
    id: string;
    en: string;
  };
  examples: KanjiExample[];
}

// Get kanji details by character list and level
export const getKanjiDetailsByCharacters = (
  characters: string[],
  level: string
): KanjiDetail[] => {
  let kanjiData: typeof n5KanjiData;
  
  switch (level.toUpperCase()) {
    case "N5":
      kanjiData = n5KanjiData;
      break;
    case "N4":
      kanjiData = n4KanjiData;
      break;
    default:
      return [];
  }

  return characters
    .map(char => kanjiData.items.find(kanji => kanji.character === char))
    .filter(Boolean) as KanjiDetail[];
};

// Get kanji details by lesson ID (assuming lesson structure from lesson.ts)
export const getKanjiDetailsByLessonId = (
  lessonId: number,
  level: string
): KanjiDetail[] => {
  // Import lesson utility
  const { getLessonsByLevel } = require("@/pwa/features/home/utils/lesson");
  
  const lessons = getLessonsByLevel(level);
  const lesson = lessons.find((l: any) => l.id === lessonId);
  
  if (!lesson) return [];
  
  return getKanjiDetailsByCharacters(lesson.kanjiList, level);
};

// Get kanji details by topic ID
export const getKanjiDetailsByTopicId = (
  topicId: string,
  level: string
): KanjiDetail[] => {
  // Import topic mapping
  const topicMapping = require("@/data/n5/kanji/kanji_topic_mapping.json");
  
  const category = topicMapping.topic_categories[topicId];
  if (!category) return [];
  
  return getKanjiDetailsByCharacters(category.kanji_characters, level);
};