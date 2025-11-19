/**
 * Shared language utilities for all vocabulary-related components
 * This ensures consistent language handling across different vocabulary modules
 */

export type SupportedLanguage = 'id' | 'en';

/**
 * Language mapping configuration
 * Maps language codes to their respective property keys
 */
export const LANGUAGE_MAPPING: Record<SupportedLanguage, string> = {
  'id': 'id',
  'en': 'en'
} as const;

/**
 * Interface for objects with multilingual meanings
 */
export interface MultilingualMeanings {
  meanings: {
    id: string;
    en: string;
  };
}

/**
 * Gets the appropriate meaning based on the current language
 * @param item - Object with multilingual meanings
 * @param language - Current language code
 * @returns The meaning in the specified language
 */
export function getMeaning<T extends MultilingualMeanings>(
  item: T, 
  language: SupportedLanguage
): string {
  return item.meanings[LANGUAGE_MAPPING[language] as keyof typeof item.meanings];
}

/**
 * Checks if the current language is Indonesian
 * @param language - Current language code
 * @returns True if language is Indonesian
 */
export function isIndonesianLanguage(language: string): boolean {
  return language === 'id';
}

/**
 * Gets the appropriate text based on language
 * @param language - Current language code
 * @param indonesianText - Text to show for Indonesian
 * @param englishText - Text to show for English
 * @returns The text in the specified language
 */
export function getLocalizedText(
  language: SupportedLanguage,
  indonesianText: string,
  englishText: string
): string {
  return language === 'id' ? indonesianText : englishText;
}

/**
 * Creates meanings data for dynamic display
 * Used in components that need to show multilingual content
 */
export function createMeaningsData<T extends MultilingualMeanings>(
  items: T[],
  language: SupportedLanguage
): Array<{ meaning: string; word: T }> {
  return items.map(item => ({
    meaning: getMeaning(item, language),
    word: item
  }));
}

/**
 * Interface for vocabulary pairing word objects (specific to pairing exercise)
 */
export interface VocabularyPairingWordBase extends MultilingualMeanings {
  kanji?: string;
  hiragana: string;
}

/**
 * Gets the appropriate card ID based on type and language
 * Used specifically for vocabulary pairing exercise card identification
 * @param type - Card type: "japanese" or "meaning"
 * @param vocabularyWord - The vocabulary word object
 * @param language - Current language code
 * @returns The card ID string
 */
export function getVocabularyCardId(
  type: "japanese" | "meaning",
  vocabularyWord: VocabularyPairingWordBase,
  language: SupportedLanguage
): string {
  return type === "japanese" 
    ? (vocabularyWord.kanji || vocabularyWord.hiragana)
    : getMeaning(vocabularyWord, language);
}
