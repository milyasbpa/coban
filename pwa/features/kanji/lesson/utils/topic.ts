import n5TopicMapping from '@/data/n5/kanji/kanji_topic_mapping.json'
import n4TopicMapping from '@/data/n4/kanji/kanji_topic_mapping.json'

// Define kanji item type based on the actual data structure
export interface KanjiItem {
  id: number
  character: string
  strokes: number
  readings: {
    kun: Array<{
      furigana: string
      romanji: string
    }>
    on: Array<{
      furigana: string
      romanji: string
    }>
  }
  meanings: {
    id: string
    en: string
  }
  examples: Array<{
    id: number
    word: string
    furigana: string
    romanji: string
    meanings: {
      id: string
      en: string
    }
  }>
}

export interface TopicCategory {
  name: string
  kanji_ids: number[]
  kanji_characters: string[]
  description: string
}

export interface TopicLesson {
  id: string
  name: string
  description: string
  kanjiCount: number
}

/**
 * Get topic mapping data based on level
 */
function getTopicMappingByLevel(level: string) {
  switch (level.toUpperCase()) {
    case "N5":
      return n5TopicMapping
    case "N4":
      return n4TopicMapping
    case "N3":
    case "N2":
    case "N1":
      // Return empty structure for levels that don't have topic mapping yet
      return { topic_categories: {} }
    default:
      return n5TopicMapping // Default to N5
  }
}

/**
 * Get all available topic categories
 */
export function getTopicCategories(level: string = "N5"): Record<string, TopicCategory> {
  const topicMapping = getTopicMappingByLevel(level)
  return topicMapping.topic_categories
}

/**
 * Get kanji filtered by topic using kanji_ids from mapping
 */
export function getKanjiByTopic(allKanji: KanjiItem[], topicId: string, level: string = "N5"): KanjiItem[] {
  const topicMapping = getTopicMappingByLevel(level)
  const category = topicMapping.topic_categories[topicId as keyof typeof topicMapping.topic_categories] as TopicCategory
  if (!category || !category.kanji_ids) return []
  
  return allKanji.filter(kanji => category.kanji_ids.includes(kanji.id))
}

/**
 * Get topic lessons with kanji count
 */
export function getTopicLessons(level: string = "N5"): TopicLesson[] {
  const categories = getTopicCategories(level)
  
  return Object.entries(categories).map(([id, category]) => {
    return {
      id,
      name: category.name,
      description: category.description,
      kanjiCount: category.kanji_ids.length
    }
  })
}

/**
 * Get topic lesson by ID
 */
export function getTopicLessonById(topicId: string, level: string = "N5"): TopicLesson | null {
  const topicMapping = getTopicMappingByLevel(level)
  const category = topicMapping.topic_categories[topicId as keyof typeof topicMapping.topic_categories] as TopicCategory
  
  if (!category || !category.kanji_ids) return null
  
  return {
    id: topicId,
    name: category.name,
    description: category.description,
    kanjiCount: category.kanji_ids.length
  }
}

/**
 * Group kanji by their topics using kanji_ids mapping
 */
export function groupKanjiByTopic(allKanji: KanjiItem[], level: string = "N5"): Record<string, KanjiItem[]> {
  const grouped: Record<string, KanjiItem[]> = {}
  const categories = getTopicCategories(level)
  
  Object.entries(categories).forEach(([topicId, category]) => {
    grouped[topicId] = allKanji.filter(kanji => category.kanji_ids.includes(kanji.id))
  })
  
  return grouped
}