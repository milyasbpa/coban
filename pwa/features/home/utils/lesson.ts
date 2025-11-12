import { KanjiService, KanjiDetail } from "@/pwa/core/services/kanji";

export interface Lesson {
  id: number;
  level: string;
  lessonNumber: number;
  progress: number;
  kanji: KanjiDetail[];  // Single source of truth - full kanji objects
}

// Mengelompokkan kanji berdasarkan stroke count menggunakan KanjiService
const groupKanjiByStrokes = (
  kanjiItems: KanjiDetail[]
): { [key: number]: KanjiDetail[] } => {
  return kanjiItems.reduce((acc, kanji) => {
    if (!acc[kanji.strokes]) {
      acc[kanji.strokes] = [];
    }
    acc[kanji.strokes].push(kanji);
    return acc;
  }, {} as { [key: number]: KanjiDetail[] });
};

// Membuat lesson dengan maksimal 5 kanji per lesson
const createLessonsFromKanjiGroups = (
  kanjiGroups: { [key: number]: KanjiDetail[] },
  level: string
): Lesson[] => {
  const lessons: Lesson[] = [];
  let lessonId = 1;
  let lessonNumber = 1;

  // Urutkan berdasarkan stroke count
  const sortedStrokes = Object.keys(kanjiGroups)
    .map(Number)
    .sort((a, b) => a - b);

  // Kumpulkan semua kanji dalam urutan stroke count
  const allKanji: KanjiDetail[] = [];
  sortedStrokes.forEach((strokes) => {
    allKanji.push(...kanjiGroups[strokes]);
  });

  // Bagi kanji menjadi chunks dengan maksimal 5 kanji per lesson
  const kanjiPerLesson = 5;
  for (let i = 0; i < allKanji.length; i += kanjiPerLesson) {
    const kanjiChunk = allKanji.slice(i, i + kanjiPerLesson);
    
    lessons.push({
      id: lessonId++,
      level: level,
      lessonNumber: lessonNumber++,
      progress: Math.floor(Math.random() * 100), // Random progress untuk sekarang
      kanji: kanjiChunk,
    });
  }

  return lessons;
};

// Helper function untuk mendapatkan lessons berdasarkan level - menggunakan KanjiService
export const getLessonsByLevel = (level: string): Lesson[] => {
  // Get all kanji for the level using KanjiService (single source of truth)
  const allKanji = KanjiService.getAllKanjiByLevel(level);
  
  if (allKanji.length === 0) {
    return [];
  }

  // Group kanji by stroke count
  const kanjiGroups = groupKanjiByStrokes(allKanji);
  
  // Create lessons from grouped kanji
  return createLessonsFromKanjiGroups(kanjiGroups, level.toUpperCase());
};
