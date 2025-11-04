/**
 * Utility for mapping words to their parent kanji characters
 * This helps in creating accurate word-based scoring relationships
 */

import n5KanjiData from "@/data/n5/kanji/kanji.json";
import n4KanjiData from "@/data/n4/kanji/kanji.json";

interface KanjiMapping {
  kanjiId: string;
  character: string;
  words: string[];
}

export class KanjiWordMapper {
  private static kanjiMappings: Map<string, KanjiMapping> = new Map();
  
  /**
   * Initialize mappings from kanji data files
   */
  static initializeMappings(level: string = "N5") {
    if (this.kanjiMappings.size > 0) return; // Already initialized
    
    let kanjiData: any;
    switch (level.toUpperCase()) {
      case "N5":
        kanjiData = n5KanjiData;
        break;
      case "N4":
        kanjiData = n4KanjiData;
        break;
      default:
        console.warn(`Level ${level} not supported, falling back to N5`);
        kanjiData = n5KanjiData;
    }
    
    if (kanjiData?.items) {
      kanjiData.items.forEach((item: any) => {
        const words = item.examples?.map((ex: any) => ex.word) || [];
        const mapping: KanjiMapping = {
          kanjiId: item.id.toString(),
          character: item.character,
          words: words,
        };
        
        // Map each word to its parent kanji
        words.forEach((word: string) => {
          this.kanjiMappings.set(word, mapping);
        });
        
        // Also map the kanji character itself
        this.kanjiMappings.set(item.character, mapping);
      });
    }
  }
  
  /**
   * Get parent kanji information for a given word
   * @param word The word to find parent kanji for
   * @param level JLPT level for initialization
   * @returns Kanji mapping or null if not found
   */
  static getParentKanji(word: string, level: string = "N5"): KanjiMapping | null {
    this.initializeMappings(level);
    
    // Direct lookup first
    const directMapping = this.kanjiMappings.get(word);
    if (directMapping) {
      return directMapping;
    }
    
    // Fallback: find by kanji characters in the word
    const kanjiChars = word.match(/[\u4e00-\u9faf]/g);
    if (kanjiChars && kanjiChars.length > 0) {
      // Try to find mapping for the first kanji character
      const firstKanjiMapping = this.kanjiMappings.get(kanjiChars[0]);
      if (firstKanjiMapping) {
        return firstKanjiMapping;
      }
    }
    
    return null;
  }
  
  /**
   * Get all words for a specific kanji ID
   * @param kanjiId The kanji ID to get words for
   * @param level JLPT level
   * @returns Array of words for this kanji
   */
  static getWordsForKanji(kanjiId: string, level: string = "N5"): string[] {
    this.initializeMappings(level);
    
    for (const mapping of this.kanjiMappings.values()) {
      if (mapping.kanjiId === kanjiId) {
        return mapping.words;
      }
    }
    
    return [];
  }
  
  /**
   * Get total word count for a kanji (for score calculation)
   * @param word Any word belonging to the kanji
   * @param level JLPT level
   * @returns Total number of words for the parent kanji
   */
  static getTotalWordsForKanji(word: string, level: string = "N5"): number {
    const parentKanji = this.getParentKanji(word, level);
    return parentKanji ? parentKanji.words.length : 1; // Fallback to 1 if not found
  }
  
  /**
   * Get accurate kanji ID and character for a word
   * @param word The word to analyze
   * @param level JLPT level
   * @returns Object with kanjiId and kanjiCharacter
   */
  static getKanjiInfo(word: string, level: string = "N5"): {
    kanjiId: string;
    kanjiCharacter: string;
    totalWords: number;
  } {
    const parentKanji = this.getParentKanji(word, level);
    
    if (parentKanji) {
      return {
        kanjiId: parentKanji.kanjiId,
        kanjiCharacter: parentKanji.character,
        totalWords: parentKanji.words.length,
      };
    }
    
    // Fallback for unmapped words
    const kanjiChar = word.match(/[\u4e00-\u9faf]/)?.[0] || word;
    return {
      kanjiId: kanjiChar,
      kanjiCharacter: kanjiChar,
      totalWords: 1,
    };
  }
  
  /**
   * Group words by their parent kanji
   * @param words Array of words to group
   * @param level JLPT level
   * @returns Map of kanjiId to words array
   */
  static groupWordsByKanji(words: string[], level: string = "N5"): Map<string, string[]> {
    this.initializeMappings(level);
    const groups = new Map<string, string[]>();
    
    words.forEach(word => {
      const kanjiInfo = this.getKanjiInfo(word, level);
      const existingWords = groups.get(kanjiInfo.kanjiId) || [];
      groups.set(kanjiInfo.kanjiId, [...existingWords, word]);
    });
    
    return groups;
  }
  
  /**
   * Clear mappings (useful for testing or level switching)
   */
  static clearMappings() {
    this.kanjiMappings.clear();
  }
}