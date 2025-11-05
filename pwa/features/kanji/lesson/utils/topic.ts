import { KanjiService, type KanjiDetail, type TopicCategory } from '@/pwa/core/services/kanji'

// Use KanjiDetail from service instead of local KanjiItem
export type KanjiItem = KanjiDetail

export interface TopicLesson {
  id: string
  name: string
  description: string
  kanjiCount: number
}

/**
 * Get topic lessons with kanji count - topic-specific business logic
 */
export function getTopicLessons(level: string = "N5"): TopicLesson[] {
  const categories = KanjiService.getTopicCategories(level)
  
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
 * Get topic lesson by ID - topic-specific business logic
 */
export function getTopicLessonById(topicId: string, level: string = "N5"): TopicLesson | null {
  const categories = KanjiService.getTopicCategories(level)
  const category = categories[topicId] as TopicCategory
  
  if (!category || !category.kanji_ids) return null
  
  return {
    id: topicId,
    name: category.name,
    description: category.description,
    kanjiCount: category.kanji_ids.length
  }
}

/**
 * Group kanji by their topics using kanji_ids mapping - topic-specific business logic
 */
export function groupKanjiByTopic(allKanji: KanjiItem[], level: string = "N5"): Record<string, KanjiItem[]> {
  const grouped: Record<string, KanjiItem[]> = {}
  const categories = KanjiService.getTopicCategories(level)
  
  Object.entries(categories).forEach(([topicId, category]) => {
    grouped[topicId] = allKanji.filter(kanji => category.kanji_ids.includes(kanji.id))
  })
  
  return grouped
}