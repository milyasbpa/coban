"use client";

import { LessonCard } from "../components/lesson-card";

// Mock data - nanti bisa dari API atau data layer
interface Lesson {
  id: number;
  level: string;
  lessonNumber: number;
  progress: number;
  kanjiList: string[];
}

const mockLessons: Lesson[] = [
  {
    id: 1,
    level: "N5",
    lessonNumber: 1,
    progress: 97,
    kanjiList: ["一", "二", "三", "四", "五"]
  },
  {
    id: 2,
    level: "N5", 
    lessonNumber: 2,
    progress: 97,
    kanjiList: ["六", "七", "八", "九", "十"]
  }
];

export function LessonsSection() {
  const handleExerciseClick = (lessonId: number) => {
    console.log(`Starting exercise for lesson ${lessonId}`);
    // TODO: Navigate to exercise page
  };

  const handleListClick = (lessonId: number) => {
    console.log(`Opening kanji list for lesson ${lessonId}`);
    // TODO: Navigate to kanji list page
  };

  return (
    <div className="space-y-4">
      {mockLessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          level={lesson.level}
          lessonNumber={lesson.lessonNumber}
          progress={lesson.progress}
          kanjiList={lesson.kanjiList}
          onExerciseClick={() => handleExerciseClick(lesson.id)}
          onListClick={() => handleListClick(lesson.id)}
        />
      ))}
    </div>
  );
}