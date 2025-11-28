import {
  KanjiService,
  KanjiDetail,
  KanjiExample,
} from "@/pwa/core/services/kanji";

// Use KanjiDetail from service, just add level info
export interface KanjiItem extends KanjiDetail {
  level?: string; // Add level information
}

// Get all kanji by level
export const getAllKanjiByLevel = (level: string): KanjiItem[] => {
  switch (level.toUpperCase()) {
    case "N5":
      return KanjiService.getAllKanjiByLevel("N5").map((kanji) => ({
        ...kanji,
        level: "N5",
      }));
    case "N4":
      return KanjiService.getAllKanjiByLevel("N4").map((kanji) => ({
        ...kanji,
        level: "N4",
      }));
    case "N3":
      return KanjiService.getAllKanjiByLevel("N3").map((kanji) => ({
        ...kanji,
        level: "N3",
      }));
    case "N2":
      return KanjiService.getAllKanjiByLevel("N2").map((kanji) => ({
        ...kanji,
        level: "N2",
      }));
    case "ALL":
      const n5WithLevel = KanjiService.getAllKanjiByLevel("N5").map(
        (kanji) => ({
          ...kanji,
          level: "N5" as string,
        })
      );
      const n4WithLevel = KanjiService.getAllKanjiByLevel("N4").map(
        (kanji) => ({
          ...kanji,
          level: "N4" as string,
        })
      );
      const n3WithLevel = KanjiService.getAllKanjiByLevel("N3").map(
        (kanji) => ({
          ...kanji,
          level: "N3" as string,
        })
      );
      const n2WithLevel = KanjiService.getAllKanjiByLevel("N2").map(
        (kanji) => ({
          ...kanji,
          level: "N2" as string,
        })
      );
      return [...n5WithLevel, ...n4WithLevel, ...n3WithLevel, ...n2WithLevel];

    case "N1":
      // Return empty array for levels without data
      return [];
    default:
      return KanjiService.getAllKanjiByLevel("N5").map((kanji) => ({
        ...kanji,
        level: "N5",
      }));
  }
};

// Get available levels (only levels with actual data)
export const getAvailableLevels = () => {
  return ["All", "N5", "N4", "N3", "N2"];
};

// Get kanji by ID and level (for kanji detail navigation)
export const getKanjiById = (id: number, level: string): KanjiItem | null => {
  const kanji = KanjiService.getKanjiById(id, level);

  if (!kanji) return null;

  return {
    ...kanji,
    level: level.toUpperCase(),
  };
};

// Get kanji by character (alternative way to find kanji)
export const getKanjiByCharacter = (character: string): KanjiItem | null => {
  const kanji = KanjiService.getKanjiByCharacter(character);

  if (!kanji) return null;

  // Determine level based on the kanji found
  const n5Kanji = KanjiService.getKanjiById(kanji.id, "N5");
  const level = n5Kanji ? "N5" : "N4";

  return {
    ...kanji,
    level,
  };
};
