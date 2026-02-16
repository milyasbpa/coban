import { KanjiService, KanjiDetail } from "@/pwa/core/services/kanji";

/**
 * Get the previous kanji in the same level
 */
export const getPreviousKanji = (
  currentId: number,
  level: string
): KanjiDetail | null => {
  const allKanji = KanjiService.getAllKanjiByLevel(level);
  const currentIndex = allKanji.findIndex((k) => k.id === currentId);
  
  if (currentIndex <= 0) return null;
  
  return allKanji[currentIndex - 1];
};

/**
 * Get the next kanji in the same level
 */
export const getNextKanji = (
  currentId: number,
  level: string
): KanjiDetail | null => {
  const allKanji = KanjiService.getAllKanjiByLevel(level);
  const currentIndex = allKanji.findIndex((k) => k.id === currentId);
  
  if (currentIndex === -1 || currentIndex >= allKanji.length - 1) return null;
  
  return allKanji[currentIndex + 1];
};
