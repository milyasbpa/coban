import n5KanjiData from "@/data/n5/kanji/kanji.json";
import n4KanjiData from "@/data/n4/kanji/kanji.json";
import n5TopicMapping from '@/data/n5/kanji/kanji_topic_mapping.json';
import n4TopicMapping from '@/data/n4/kanji/kanji_topic_mapping.json';
import { getLessonsByLevel } from "@/pwa/features/home/utils/lesson";

interface KanjiReading {
  furigana: string;
  romanji: string;
}

interface KanjiExample {
  id: number;
  word: string;
  furigana: string;
  romanji: string;
  meanings: {
    id: string;
    en: string;
  };
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
      case "N2":
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
   * Get kanji details by lesson ID
   */
  static getKanjiDetailsByLessonId(
    lessonId: number,
    level: string
  ): KanjiDetail[] {
    const lessons = getLessonsByLevel(level);
    const lesson = lessons.find((l: any) => l.id === lessonId);

    if (!lesson) return [];

    return this.getKanjiDetailsByCharacters(lesson.kanjiList, level);
  }

  /**
   * Get kanji details by topic ID
   */
  static getKanjiDetailsByTopicId(
    topicId: string,
    level: string
  ): KanjiDetail[] {
    const categories = this.getTopicCategories(level);
    const category = categories[topicId];
    if (!category) return [];

    return this.getKanjiDetailsByCharacters(category.kanji_characters, level);
  }

  /**
   * Get all available topic categories - moved from topic.ts (general function)
   */
  static getTopicCategories(level: string = "N5"): Record<string, TopicCategory> {
    const topicMapping = this.getTopicMappingData(level);
    return topicMapping.topic_categories;
  }

  /**
   * Get kanji filtered by topic using kanji_ids from mapping - moved from topic.ts (general function)
   */
  static getKanjiByTopic(allKanji: KanjiDetail[], topicId: string, level: string = "N5"): KanjiDetail[] {
    const topicMapping = this.getTopicMappingData(level);
    const category = topicMapping.topic_categories[topicId as keyof typeof topicMapping.topic_categories] as TopicCategory;
    if (!category || !category.kanji_ids) return [];
    
    return allKanji.filter(kanji => category.kanji_ids.includes(kanji.id));
  }
}