export interface KanjiCharacter {
  id: number;
  character: string;
  strokes: number;
  readings: {
    kun: string[];
    on: string[];
  };
  meanings: {
    primary: string;
    english: string;
  };
  examples: KanjiExample[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

import { KanjiExample } from "@/pwa/core/services/kanji";

export interface KanjiLesson {
  lesson_info: {
    id: string;
    level: string;
    category: 'kanji';
    lesson_number: number;
    title: string;
    description: string;
    total_items: number;
  };
  kanji: KanjiCharacter[];
}

export interface VocabularyLesson {
  lesson_info: {
    id: string;
    level: string;
    category: 'vocabulary';
    lesson_number: number;
    title: string;
    description: string;
    total_items: number;
  };
  vocabulary: VocabularyItem[];
}

export interface VocabularyItem {
  id: number;
  word: string;
  reading: string;
  meanings: {
    primary: string;
    english: string;
  };
  example_sentence: {
    japanese: string;
    reading: string;
    meaning: string;
  };
  difficulty: 'basic' | 'intermediate' | 'advanced';
  category: string;
}

export interface LessonIndex {
  id: string;
  lesson_number: number;
  title: string;
  file: string;
  kanji_preview?: string[];
  total_kanji?: number;
  total_items?: number;
  difficulty: string;
}

export interface CategoryIndex {
  category_info: {
    id: string;
    name: string;
    level: string;
    total_lessons: number;
    total_kanji?: number;
    total_items?: number;
    description: string;
  };
  lessons: LessonIndex[];
}

export interface Level {
  id: string;
  name: string;
  title: string;
  total_kanji: number;
  color: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ExerciseType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}