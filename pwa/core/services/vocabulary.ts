import n5VocabularyData from "@/data/n5/vocabulary/vocabulary.json";
import n4VocabularyData from "@/data/n4/vocabulary/vocabulary.json";

export interface VocabularyWord {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meanings: {
    en: string;
    id: string;
  };
}

export interface VocabularyCategory {
  id: number;
  category: {
    id: string;
    en: string;
  };
  vocabulary: VocabularyWord[];
}

/**
 * Vocabulary Service - Centralized data access layer for vocabulary operations
 * Handles all vocabulary JSON data imports and basic vocabulary queries
 */
export class VocabularyService {
  /**
   * Get vocabulary data by level - centralized data source management
   */
  private static getVocabularyData(level: string) {
    switch (level.toUpperCase()) {
      case "N5":
        return n5VocabularyData;
      case "N4":
        return n4VocabularyData;
      default:
        return null;
    }
  }

  /**
   * Get all vocabulary categories by level
   */
  static getVocabularyCategories(level: string = "N5"): VocabularyCategory[] {
    const vocabularyData = this.getVocabularyData(level);
    if (!vocabularyData || !vocabularyData.items) return [];

    return vocabularyData.items;
  }

  /**
   * Get vocabulary by category ID
   */
  static getVocabularyByCategory(
    categoryId: number,
    level: string = "N5"
  ): VocabularyCategory | null {
    const categories = this.getVocabularyCategories(level);
    return categories.find((cat) => cat.id === categoryId) || null;
  }

  /**
   * Get vocabulary category by string ID (like "ANGKA") or numeric ID
   */
  static getVocabularyByCategoryString(
    categoryStringId: string,
    level: string = "N5"
  ): VocabularyCategory | null {
    const categories = this.getVocabularyCategories(level);

    // First, try to find by numeric id (e.g., "1")
    let category = categories.find(
      (cat) => String(cat.id) === categoryStringId
    );

    // If not found, try to find by category.id string match (e.g., "ANGKA")
    if (!category) {
      category = categories.find(
        (cat) => cat.category.id === categoryStringId
      );
    }

    return category || null;
  }

  /**
   * Get all vocabulary words by level (flattened from all categories)
   */
  static getAllVocabularyByLevel(level: string = "N5"): VocabularyWord[] {
    const categories = this.getVocabularyCategories(level);
    return categories.flatMap((cat) => cat.vocabulary);
  }

  /**
   * Get vocabulary word by ID within a category
   */
  static getVocabularyWordById(
    categoryId: number,
    wordId: number,
    level: string = "N5"
  ): VocabularyWord | null {
    const category = this.getVocabularyByCategory(categoryId, level);
    if (!category) return null;

    return category.vocabulary.find((word) => word.id === wordId) || null;
  }

  /**
   * Get vocabulary info for scoring system
   * Similar to KanjiService.getKanjiInfoForScoring()
   */
  static getVocabularyInfoForScoring(
    word: string,
    level: string = "N5"
  ): {
    categoryId: string;
    categoryName: string;
    totalWords: number;
  } {
    const categories = this.getVocabularyCategories(level);

    // Find category that contains this word
    for (const category of categories) {
      const wordFound = category.vocabulary.some(
        (vocab) =>
          vocab.kanji === word ||
          vocab.hiragana === word ||
          vocab.romaji === word
      );

      if (wordFound) {
        return {
          categoryId: category.id.toString(),
          categoryName: category.category.en,
          totalWords: category.vocabulary.length,
        };
      }
    }

    // Fallback
    return {
      categoryId: "unknown",
      categoryName: "Unknown",
      totalWords: 1,
    };
  }

  /**
   * Get total words count for a vocabulary category (for scoring calculation)
   */
  static getTotalWordsForCategory(
    categoryId: number,
    level: string = "N5"
  ): number {
    const category = this.getVocabularyByCategory(categoryId, level);
    return category ? category.vocabulary.length : 0;
  }

  /**
   * Search vocabulary by term (kanji, hiragana, romaji, or meaning)
   */
  static searchVocabulary(
    searchTerm: string,
    level: string = "N5"
  ): VocabularyWord[] {
    const allWords = this.getAllVocabularyByLevel(level);
    const term = searchTerm.toLowerCase();

    return allWords.filter(
      (word) =>
        word.kanji.toLowerCase().includes(term) ||
        word.hiragana.toLowerCase().includes(term) ||
        word.romaji.toLowerCase().includes(term) ||
        word.meanings.en.toLowerCase().includes(term) ||
        word.meanings.id.toLowerCase().includes(term)
    );
  }
}
