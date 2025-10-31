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

export interface KanjiItem {
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

// Get all kanji by level
export const getAllKanjiByLevel = (level: string): KanjiItem[] => {
  switch (level.toUpperCase()) {
    case "N5":
      return n5KanjiData.items;
    case "N4":
      return n4KanjiData.items;
    case "ALL":
      return [...n5KanjiData.items, ...n4KanjiData.items];
    default:
      return n5KanjiData.items;
  }
};

// Get available levels
export const getAvailableLevels = () => {
  return ["All", "N5", "N4", "N3", "N2", "N1"];
};