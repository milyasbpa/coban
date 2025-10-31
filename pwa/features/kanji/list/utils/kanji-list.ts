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
  level?: string; // Add level information
}

// Get all kanji by level
export const getAllKanjiByLevel = (level: string): KanjiItem[] => {
  switch (level.toUpperCase()) {
    case "N5":
      return n5KanjiData.items.map(kanji => ({
        ...kanji,
        level: "N5"
      }));
    case "N4":
      return n4KanjiData.items.map(kanji => ({
        ...kanji,
        level: "N4"
      }));
    case "ALL":
      // No need to modify IDs, just add level info
      const n5WithLevel = n5KanjiData.items.map(kanji => ({
        ...kanji,
        level: "N5" as string
      }));
      const n4WithLevel = n4KanjiData.items.map(kanji => ({
        ...kanji,
        level: "N4" as string
      }));
      return [...n5WithLevel, ...n4WithLevel];
    case "N3":
    case "N2":
    case "N1":
      // Return empty array for levels without data
      return [];
    default:
      return n5KanjiData.items.map(kanji => ({
        ...kanji,
        level: "N5"
      }));
  }
};

// Get available levels (only levels with actual data)
export const getAvailableLevels = () => {
  return ["All", "N5", "N4"];
};

// Get kanji by ID and level (for kanji detail navigation)
export const getKanjiById = (id: number, level: string): KanjiItem | null => {
  const kanjiData = level.toUpperCase() === "N5" ? n5KanjiData : n4KanjiData;
  const kanji = kanjiData.items.find(k => k.id === id);
  
  if (!kanji) return null;
  
  return {
    ...kanji,
    level: level.toUpperCase()
  };
};

// Get kanji by character (alternative way to find kanji)
export const getKanjiByCharacter = (character: string): KanjiItem | null => {
  // Try N5 first
  const n5Kanji = n5KanjiData.items.find(k => k.character === character);
  if (n5Kanji) {
    return {
      ...n5Kanji,
      level: "N5"
    };
  }
  
  // Try N4
  const n4Kanji = n4KanjiData.items.find(k => k.character === character);
  if (n4Kanji) {
    return {
      ...n4Kanji,
      level: "N4"
    };
  }
  
  return null;
};