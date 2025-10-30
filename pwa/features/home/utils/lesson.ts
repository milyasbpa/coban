import n5KanjiData from "@/data/n5/kanji/kanji.json";
import n4KanjiData from "@/data/n4/kanji/kanji.json";

interface Lesson {
  id: number;
  level: string;
  lessonNumber: number;
  progress: number;
  kanjiList: string[];
}

interface KanjiItem {
  id: number;
  character: string;
  strokes: number;
}

// Mengelompokkan kanji berdasarkan stroke count
const groupKanjiByStrokes = (
  kanjiItems: KanjiItem[]
): { [key: number]: string[] } => {
  return kanjiItems.reduce((acc, kanji) => {
    if (!acc[kanji.strokes]) {
      acc[kanji.strokes] = [];
    }
    acc[kanji.strokes].push(kanji.character);
    return acc;
  }, {} as { [key: number]: string[] });
};

// Membuat lesson berdasarkan stroke count (satu lesson per stroke count)
const createLessonsFromKanjiGroups = (
  kanjiGroups: { [key: number]: string[] },
  level: string
): Lesson[] => {
  const lessons: Lesson[] = [];
  let lessonId = 1;
  let lessonNumber = 1;

  // Urutkan berdasarkan stroke count
  const sortedStrokes = Object.keys(kanjiGroups)
    .map(Number)
    .sort((a, b) => a - b);

  sortedStrokes.forEach((strokes) => {
    const kanjiList = kanjiGroups[strokes];

    // Satu lesson untuk setiap stroke count
    lessons.push({
      id: lessonId++,
      level: level,
      lessonNumber: lessonNumber++,
      progress: Math.floor(Math.random() * 100), // Random progress untuk sekarang
      kanjiList: kanjiList, // Semua kanji dengan stroke yang sama
    });
  });

  return lessons;
};

// Helper function untuk mendapatkan lessons berdasarkan level
export const getLessonsByLevel = (level: string): Lesson[] => {
  switch (level.toUpperCase()) {
    case "N5":
      const n5KanjiGroups = groupKanjiByStrokes(n5KanjiData.items);
      return createLessonsFromKanjiGroups(n5KanjiGroups, "N5");

    case "N4":
      const n4KanjiGroups = groupKanjiByStrokes(n4KanjiData.items);
      return createLessonsFromKanjiGroups(n4KanjiGroups, "N4");

    default:
      return [];
  }
};
