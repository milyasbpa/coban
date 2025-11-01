import topicMapping from '@/data/n5/kanji/kanji_topic_mapping.json'

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
    word: string
    furigana: string
    romanji: string
    meaning_id: string
    meaning_en: string
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
 * Get all available topic categories
 */
export function getTopicCategories(): Record<string, TopicCategory> {
  return topicMapping.topic_categories
}

/**
 * Get kanji filtered by topic using kanji_ids from mapping
 */
export function getKanjiByTopic(allKanji: KanjiItem[], topicId: string): KanjiItem[] {
  const category = topicMapping.topic_categories[topicId as keyof typeof topicMapping.topic_categories]
  if (!category) return []
  
  return allKanji.filter(kanji => category.kanji_ids.includes(kanji.id))
}

/**
 * Get topic lessons with kanji count
 */
export function getTopicLessons(): TopicLesson[] {
  const categories = getTopicCategories()
  
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
export function getTopicLessonById(topicId: string): TopicLesson | null {
  const category = topicMapping.topic_categories[topicId as keyof typeof topicMapping.topic_categories]
  
  if (!category) return null
  
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
export function groupKanjiByTopic(allKanji: KanjiItem[]): Record<string, KanjiItem[]> {
  const grouped: Record<string, KanjiItem[]> = {}
  const categories = getTopicCategories()
  
  Object.entries(categories).forEach(([topicId, category]) => {
    grouped[topicId] = allKanji.filter(kanji => category.kanji_ids.includes(kanji.id))
  })
  
  return grouped
}