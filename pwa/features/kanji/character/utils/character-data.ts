import { KanjiDetail, KanjiExample } from "@/pwa/core/services/kanji";
import { KanjiService } from "@/pwa/core/services/kanji";

/**
 * Extended kanji detail with level information
 */
export interface CharacterData extends KanjiDetail {
  level: string;
}

/**
 * Get character data by ID and level
 */
export const getCharacterData = (
  id: string,
  level: string
): CharacterData | null => {
  const kanjiId = parseInt(id, 10);
  if (isNaN(kanjiId)) return null;

  const kanjiList = KanjiService.getKanjiDetailsByIds([kanjiId], level);
  
  if (kanjiList.length === 0) return null;

  return {
    ...kanjiList[0],
    level,
  };
};

/**
 * Word item for display with vocabulary information
 */
export interface WordItem extends KanjiExample {
  vocabularyId: string; // For score lookup
}

/**
 * Get words list from kanji examples with vocabulary IDs
 * Format vocabularyId as "level_exampleId" for score lookup
 */
export const getWordsFromCharacter = (
  character: CharacterData
): WordItem[] => {
  return character.examples.map((example) => ({
    ...example,
    vocabularyId: `${character.level}_${example.id}`,
  }));
};
