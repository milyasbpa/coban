import n5GrammarData from "@/data/n5/grammar/grammar.json";
import { GrammarData, GrammarPattern } from "@/types/grammar";

/**
 * Grammar Service - Centralized data access layer for grammar operations
 * Handles all JSON data imports and basic grammar queries
 */
export class GrammarService {
  /**
   * Get grammar data by level - centralized data source management
   */
  private static getGrammarData(level: string): GrammarData | null {
    switch (level.toUpperCase()) {
      case "N5":
        return n5GrammarData as GrammarData;
      case "N4":
      case "N3":
      case "N2":
      case "N1":
        // TODO: Add data when available
        return null;
      default:
        return null;
    }
  }

  /**
   * Get all grammar patterns by level
   */
  static getAllPatternsByLevel(level: string): GrammarPattern[] {
    const grammarData = this.getGrammarData(level);
    if (!grammarData) return [];

    return grammarData.items;
  }

  /**
   * Get grammar pattern by ID and level
   */
  static getPatternById(id: number, level: string): GrammarPattern | null {
    const grammarData = this.getGrammarData(level);
    if (!grammarData) return null;

    return grammarData.items.find((pattern) => pattern.id === id) || null;
  }

  /**
   * Get grammar patterns by category ID
   */
  static getPatternsByCategory(
    categoryId: string,
    level: string
  ): GrammarPattern[] {
    const grammarData = this.getGrammarData(level);
    if (!grammarData) return [];

    return grammarData.items.filter(
      (pattern) => pattern.category.id === categoryId
    );
  }

  /**
   * Get grammar patterns by type (sentence, particle, etc)
   */
  static getPatternsByType(
    type: string,
    level: string
  ): GrammarPattern[] {
    const grammarData = this.getGrammarData(level);
    if (!grammarData) return [];

    return grammarData.items.filter((pattern) => pattern.type === type);
  }

  /**
   * Get related patterns for a specific pattern
   */
  static getRelatedPatterns(
    patternId: number,
    level: string
  ): GrammarPattern[] {
    const pattern = this.getPatternById(patternId, level);
    if (!pattern || !pattern.related_patterns) return [];

    const grammarData = this.getGrammarData(level);
    if (!grammarData) return [];

    return grammarData.items.filter((p) =>
      pattern.related_patterns.includes(p.id)
    );
  }

  /**
   * Get all unique categories for a level
   */
  static getCategories(level: string): Array<{
    id: string;
    name: { id: string; en: string };
    patterns: GrammarPattern[];
  }> {
    const grammarData = this.getGrammarData(level);
    if (!grammarData) return [];

    const categoriesMap = new Map<
      string,
      {
        id: string;
        name: { id: string; en: string };
        patterns: GrammarPattern[];
      }
    >();

    grammarData.items.forEach((pattern) => {
      const catId = pattern.category.id;
      if (!categoriesMap.has(catId)) {
        categoriesMap.set(catId, {
          id: catId,
          name: pattern.category.name,
          patterns: [],
        });
      }
      categoriesMap.get(catId)!.patterns.push(pattern);
    });

    return Array.from(categoriesMap.values());
  }

  /**
   * Search patterns by keyword (pattern, japanese, romanji, or meanings)
   */
  static searchPatterns(keyword: string, level: string): GrammarPattern[] {
    const grammarData = this.getGrammarData(level);
    if (!grammarData) return [];

    const lowerKeyword = keyword.toLowerCase();

    return grammarData.items.filter(
      (pattern) =>
        pattern.pattern.toLowerCase().includes(lowerKeyword) ||
        pattern.japanese.includes(keyword) ||
        pattern.romanji.toLowerCase().includes(lowerKeyword) ||
        pattern.meanings.id.toLowerCase().includes(lowerKeyword) ||
        pattern.meanings.en.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Get pattern info for scoring system
   */
  static getPatternInfoForScoring(
    patternId: number,
    level: string = "N5"
  ): {
    patternId: string;
    pattern: string;
    totalExamples: number;
  } {
    const pattern = this.getPatternById(patternId, level);
    
    if (!pattern) {
      return {
        patternId: patternId.toString(),
        pattern: "unknown",
        totalExamples: 0,
      };
    }

    return {
      patternId: pattern.id.toString(),
      pattern: pattern.pattern,
      totalExamples: pattern.examples?.length || 0,
    };
  }

  /**
   * Get total examples count for a pattern (for scoring calculation)
   */
  static getTotalExamplesForPattern(patternId: number, level: string = "N5"): number {
    const pattern = this.getPatternById(patternId, level);
    return pattern?.examples?.length || 0;
  }
}
