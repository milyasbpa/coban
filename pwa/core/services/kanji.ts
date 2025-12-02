import n5KanjiData from "@/data/n5/kanji/kanji.json";
import n4KanjiData from "@/data/n4/kanji/kanji.json";
import n3KanjiData from "@/data/n3/kanji/kanji.json";
import n2KanjiData from "@/data/n2/kanji/kanji.json";
import n5TopicMapping from "@/data/n5/kanji/kanji_topic_mapping.json";
import n4TopicMapping from "@/data/n4/kanji/kanji_topic_mapping.json";
import n3TopicMapping from "@/data/n3/kanji/kanji_topic_mapping.json";
import n2TopicMapping from "@/data/n2/kanji/kanji_topic_mapping.json";
import { getLessonsByLevel } from "@/pwa/features/home/utils/lesson";

export interface KanjiReading {
  furigana: string;
  romanji: string;
}

export interface KanjiExample {
  id: number;
  word: string;
  furigana: string;
  romanji: string;
  meanings: {
    id: string;
    en: string;
  };
}

export interface ReadingUsage {
  reading: KanjiReading;
  type: 'kun' | 'on';
  examples: KanjiExample[];
}

export interface KanjiContextData {
  kanji: KanjiDetail;
  currentWord: KanjiExample;
  usedReading: ReadingUsage | null;
  otherReadings: ReadingUsage[];
  allExamples: KanjiExample[];
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

export interface TopicCategory {
  name: string;
  kanji_ids: number[];
  kanji_characters: string[];
  description: string;
}

/**
 * Kanji Service - Centralized data access layer for kanji operations
 * Handles all JSON data imports and basic kanji queries
 */
export class KanjiService {
  /**
   * Get kanji data by level - centralized data source management
   */
  private static getKanjiData(level: string) {
    switch (level.toUpperCase()) {
      case "N5":
        return n5KanjiData;
      case "N4":
        return n4KanjiData;
      case "N3":
        return n3KanjiData;
        case "N2":
        return n2KanjiData;
      default:
        return null;
    }
  }

  /**
   * Get topic mapping data by level - centralized data source management
   */
  private static getTopicMappingData(level: string) {
    switch (level.toUpperCase()) {
      case "N5":
        return n5TopicMapping;
      case "N4":
        return n4TopicMapping;
      case "N3":
        return n3TopicMapping;
      case "N2":
        return n2TopicMapping;
      case "N1":
        // Return empty structure for levels that don't have topic mapping yet
        return { topic_categories: {} };
      default:
        return n5TopicMapping; // Default to N5
    }
  }

  /**
   * Get kanji details by character list and level
   */
  static getKanjiDetailsByCharacters(
    characters: string[],
    level: string
  ): KanjiDetail[] {
    const kanjiData = this.getKanjiData(level);
    if (!kanjiData) return [];

    return characters
      .map((char) => kanjiData.items.find((kanji) => kanji.character === char))
      .filter(Boolean) as KanjiDetail[];
  }

  /**
   * Get kanji details by ID list and level - more efficient for topic-based queries
   */
  static getKanjiDetailsByIds(
    ids: number[],
    level: string
  ): KanjiDetail[] {
    const kanjiData = this.getKanjiData(level);
    if (!kanjiData) return [];

    // Create a Map for O(1) lookup instead of O(n) for each ID
    const kanjiMap = new Map(kanjiData.items.map(kanji => [kanji.id, kanji]));
    
    return ids
      .map(id => kanjiMap.get(id))
      .filter(Boolean) as KanjiDetail[];
  }

  /**
   * Get kanji details by lesson ID - simplified with new lesson structure
   */
  static getKanjiDetailsByLessonId(
    lessonId: number,
    level: string
  ): KanjiDetail[] {
    const lessons = getLessonsByLevel(level);
    const lesson = lessons.find((l: any) => l.id === lessonId);

    if (!lesson) return [];

    // Lesson now contains full kanji objects - just return them directly!
    return lesson.kanji;
  }

  /**
   * Get kanji details by topic ID - optimized to use kanji_ids directly
   */
  static getKanjiDetailsByTopicId(
    topicId: string,
    level: string
  ): KanjiDetail[] {
    const categories = this.getTopicCategories(level);
    const category = categories[topicId];
    if (!category) return [];

    // Use kanji_ids directly for better performance instead of converting characters
    return this.getKanjiDetailsByIds(category.kanji_ids, level);
  }

  /**
   * Get all available topic categories
   */
  static getTopicCategories(
    level: string = "N5"
  ): Record<string, TopicCategory> {
    const topicMapping = this.getTopicMappingData(level);
    return topicMapping.topic_categories;
  }

  /**
   * Get kanji filtered by topic using kanji_ids 
   */
  static getKanjiByTopic(
    allKanji: KanjiDetail[],
    topicId: string,
    level: string = "N5"
  ): KanjiDetail[] {
    const topicMapping = this.getTopicMappingData(level);
    const category = topicMapping.topic_categories[
      topicId as keyof typeof topicMapping.topic_categories
    ] as TopicCategory;
    if (!category || !category.kanji_ids) return [];

    return allKanji.filter((kanji) => category.kanji_ids.includes(kanji.id));
  }

  /**
   * Get all kanji by level - for kanji list functionality
   */
  static getAllKanjiByLevel(level: string): KanjiDetail[] {
    const kanjiData = this.getKanjiData(level);
    if (!kanjiData) return [];

    return kanjiData.items;
  }

  /**
   * Get kanji by ID and level
   */
  static getKanjiById(id: number, level: string): KanjiDetail | null {
    const kanjiData = this.getKanjiData(level);
    if (!kanjiData) return null;

    return kanjiData.items.find((kanji) => kanji.id === id) || null;
  }

  /**
   * Get kanji by character
   */
  static getKanjiByCharacter(character: string): KanjiDetail | null {
    // Try N5 first
    const n5Data = this.getKanjiData("N5");
    if (n5Data) {
      const n5Kanji = n5Data.items.find(
        (kanji) => kanji.character === character
      );
      if (n5Kanji) return n5Kanji;
    }

    // Try N4
    const n4Data = this.getKanjiData("N4");
    if (n4Data) {
      const n4Kanji = n4Data.items.find(
        (kanji) => kanji.character === character
      );
      if (n4Kanji) return n4Kanji;
    }

    return null;
  }

  /**
   * Get kanji info by kanji ID for scoring system
   * Direct lookup using kanjiId - more reliable and performant than character-based lookup
   */
  static getKanjiInfoById(
    kanjiId: number,
    level: string
  ): {
    kanjiId: string;
    kanjiCharacter: string;
    totalWords: number;
  } {
    const kanjiData = this.getKanjiData(level);
    if (!kanjiData) {
      return {
        kanjiId: kanjiId.toString(),
        kanjiCharacter: "",
        totalWords: 1,
      };
    }

    const kanji = kanjiData.items.find((k) => k.id === kanjiId);
    if (kanji) {
      return {
        kanjiId: kanji.id.toString(),
        kanjiCharacter: kanji.character,
        totalWords: kanji.examples?.length || 1,
      };
    }

    // Fallback if kanji not found
    return {
      kanjiId: kanjiId.toString(),
      kanjiCharacter: "",
      totalWords: 1,
    };
  }

  /**
   * Get kanji info for scoring system
   * Replaces KanjiWordMapper.getKanjiInfo()
   */
  static getKanjiInfoForScoring(
    word: string,
    level: string = "N5"
  ): {
    kanjiId: string;
    kanjiCharacter: string;
    totalWords: number;
  } {
    const kanjiData = this.getKanjiData(level);
    if (!kanjiData) {
      // Fallback
      const kanjiChar = word.match(/[\u4e00-\u9faf]/)?.[0] || word;
      return {
        kanjiId: kanjiChar,
        kanjiCharacter: kanjiChar,
        totalWords: 1,
      };
    }

    // Direct word lookup in examples
    for (const kanji of kanjiData.items) {
      const wordFound = kanji.examples?.some((ex) => ex.word === word);
      if (wordFound) {
        return {
          kanjiId: kanji.id.toString(),
          kanjiCharacter: kanji.character,
          totalWords: kanji.examples?.length || 1,
        };
      }
    }

    // Fallback: find by kanji character in word
    const kanjiChars = word.match(/[\u4e00-\u9faf]/g);
    if (kanjiChars && kanjiChars.length > 0) {
      const kanji = kanjiData.items.find((k) => k.character === kanjiChars[0]);
      if (kanji) {
        return {
          kanjiId: kanji.id.toString(),
          kanjiCharacter: kanji.character,
          totalWords: kanji.examples?.length || 1,
        };
      }
    }

    // Final fallback
    const kanjiChar = word.match(/[\u4e00-\u9faf]/)?.[0] || word;
    return {
      kanjiId: kanjiChar,
      kanjiCharacter: kanjiChar,
      totalWords: 1,
    };
  }

  /**
   * Get total words count for a kanji (for scoring calculation)
   * Replaces KanjiWordMapper.getTotalWordsForKanji()
   */
  static getTotalWordsForKanji(word: string, level: string = "N5"): number {
    const kanjiInfo = this.getKanjiInfoForScoring(word, level);
    return kanjiInfo.totalWords;
  }

  /**
   * Get comprehensive context data for a kanji in a specific word
   * This helps user understand WHICH reading is used and WHY
   */
  static getKanjiContext(
    kanjiId: number,
    wordFurigana: string,
    level: string
  ): KanjiContextData | null {
    const kanji = this.getKanjiById(kanjiId, level);
    if (!kanji) return null;

    const currentWord = kanji.examples.find(
      (ex) => ex.furigana === wordFurigana
    );
    if (!currentWord) return null;

    // Detect which reading is used in current word
    const usedReading = this.detectUsedReading(kanji, currentWord);

    // Group other examples by reading
    const otherReadings = this.groupExamplesByReading(kanji, currentWord);

    return {
      kanji,
      currentWord,
      usedReading,
      otherReadings,
      allExamples: kanji.examples,
    };
  }

  /**
   * Detect which reading (kun/on) is used in a specific word
   * This solves: "Kenapa pakai TEI bukan CHOU?"
   */
  private static detectUsedReading(
    kanji: KanjiDetail,
    word: KanjiExample
  ): ReadingUsage | null {
    const wordFurigana = word.furigana.toLowerCase();

    // Try ON readings first
    for (const onReading of kanji.readings.on) {
      const readingHiragana = this.katakanaToHiragana(onReading.furigana);
      if (wordFurigana.includes(readingHiragana.toLowerCase())) {
        return {
          reading: onReading,
          type: 'on',
          examples: kanji.examples.filter((ex) =>
            ex.furigana.toLowerCase().includes(readingHiragana.toLowerCase())
          ),
        };
      }
    }

    // Try KUN readings
    for (const kunReading of kanji.readings.kun) {
      const readingHiragana = kunReading.furigana.toLowerCase();
      if (wordFurigana.includes(readingHiragana)) {
        return {
          reading: kunReading,
          type: 'kun',
          examples: kanji.examples.filter((ex) =>
            ex.furigana.toLowerCase().includes(readingHiragana)
          ),
        };
      }
    }

    return null;
  }

  /**
   * Group examples by reading to show patterns
   * "Kapan pakai TEI? Kapan pakai CHOU?"
   */
  private static groupExamplesByReading(
    kanji: KanjiDetail,
    currentWord: KanjiExample
  ): ReadingUsage[] {
    const groups: ReadingUsage[] = [];

    // Group by ON readings
    kanji.readings.on.forEach((onReading) => {
      const readingHiragana = this.katakanaToHiragana(onReading.furigana);
      const examples = kanji.examples.filter((ex) =>
        ex.furigana.toLowerCase().includes(readingHiragana.toLowerCase())
      );

      if (examples.length > 0) {
        groups.push({
          reading: onReading,
          type: 'on',
          examples,
        });
      }
    });

    // Group by KUN readings
    kanji.readings.kun.forEach((kunReading) => {
      const readingHiragana = kunReading.furigana.toLowerCase();
      const examples = kanji.examples.filter((ex) =>
        ex.furigana.toLowerCase().includes(readingHiragana)
      );

      if (examples.length > 0) {
        groups.push({
          reading: kunReading,
          type: 'kun',
          examples,
        });
      }
    });

    return groups;
  }

  /**
   * Convert katakana to hiragana for comparison
   */
  private static katakanaToHiragana(str: string): string {
    return str.replace(/[\u30a1-\u30f6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }

  /**
   * Get reading pattern hint for memory
   * E.g., "TEI for formal words, CHOU for counting"
   */
  static getReadingHint(
    readingUsage: ReadingUsage,
    kanji: KanjiDetail
  ): string {
    const { reading, type, examples } = readingUsage;

    // Analyze example meanings to infer pattern
    const meanings = examples.map((ex) => ex.meanings.en.toLowerCase());

    // Common patterns
    if (meanings.some((m) => m.includes('counter') || m.includes('block'))) {
      return `${reading.romanji} is often used for counting or locations`;
    }

    if (meanings.some((m) => m.includes('polite') || m.includes('formal'))) {
      return `${reading.romanji} is often used in formal or quality-related words`;
    }

    if (type === 'kun') {
      return `${reading.romanji} (KUN reading) is often used in standalone words or verbs`;
    }

    if (type === 'on') {
      return `${reading.romanji} (ON reading) is often used in compound words`;
    }

    return `${reading.romanji} is used in ${examples.length} word(s)`;
  }

  /**
   * Get related words from other lessons/topics
   * Helps with: "Kanji sama di list lain"
   */
  static getRelatedWordsAcrossLevels(
    kanjiCharacter: string,
    currentLevel: string,
    maxWords: number = 5
  ): KanjiExample[] {
    const levels = ['N5', 'N4', 'N3', 'N2'];
    const relatedWords: KanjiExample[] = [];

    for (const level of levels) {
      if (level === currentLevel) continue; // Skip current level

      const allKanji = this.getAllKanjiByLevel(level);
      const matchingKanji = allKanji.find(
        (k) => k.character === kanjiCharacter
      );

      if (matchingKanji) {
        relatedWords.push(...matchingKanji.examples);
      }
    }

    // Return limited number of most common words
    return relatedWords.slice(0, maxWords);
  }
}
