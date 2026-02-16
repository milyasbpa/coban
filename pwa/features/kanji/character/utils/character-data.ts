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
  readingType: 'kun' | 'on' | 'exception'; // Track which reading type this word comes from
  readingId: number; // Reading ID within the reading type
  uniqueKey: string; // Unique identifier combining readingType + readingId + id
}

/**
 * Get words list from kanji examples with vocabulary IDs
 * Format vocabularyId as "level_exampleId" for score lookup
 * Examples are now nested in readings (kun/on/exception)
 * Includes uniqueKey to avoid duplicate keys when same example ID appears in different readings
 */
export const getWordsFromCharacter = (
  character: CharacterData
): WordItem[] => {
  const examples: Array<KanjiExample & { readingType: 'kun' | 'on' | 'exception'; readingId: number }> = [];
  
  // Collect from kun readings
  character.readings.kun.forEach((reading) => {
    if (reading.examples) {
      examples.push(
        ...reading.examples.map(ex => ({ 
          ...ex, 
          readingType: 'kun' as const,
          readingId: reading.id
        }))
      );
    }
  });
  
  // Collect from on readings
  character.readings.on.forEach((reading) => {
    if (reading.examples) {
      examples.push(
        ...reading.examples.map(ex => ({ 
          ...ex, 
          readingType: 'on' as const,
          readingId: reading.id
        }))
      );
    }
  });
  
  // Collect from exception readings
  if (character.readings.exception?.examples) {
    examples.push(
      ...character.readings.exception.examples.map(ex => ({ 
        ...ex, 
        readingType: 'exception' as const,
        readingId: 0 // exception doesn't have reading.id
      }))
    );
  }
  
  return examples.map((example) => ({
    ...example,
    vocabularyId: `${character.level}_${example.id}`,
    uniqueKey: `${example.readingType}-${example.readingId}-${example.id}`,
  })) as WordItem[];
};
