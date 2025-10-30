"use client";

import { LessonCard } from "../components/lesson-card";
import { getLessonsByLevel } from "../utils/lesson";

// Interface untuk Lesson
interface Lesson {
  id: number;
  level: string;
  lessonNumber: number;
  progress: number;
  kanjiList: string[];
}

interface LessonsSectionProps {
  selectedLevel?: string;
}

export function LessonsSection({ selectedLevel = "N5" }: LessonsSectionProps) {
  // Ambil lessons berdasarkan level yang dipilih
  const lessons: Lesson[] = getLessonsByLevel(selectedLevel);

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
      {lessons.map((lesson: Lesson) => (
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