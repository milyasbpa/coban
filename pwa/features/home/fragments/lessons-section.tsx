"use client";

import { useRouter } from "next/navigation";
import { LessonCard } from "../components/lesson-card";
import { getLessonsByLevel } from "../utils/lesson";
import { useHomeStore } from "../store/home-store";
import { KanjiExerciseModal } from "./kanji-exercise-modal";

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
  const { openExerciseModal } = useHomeStore();
  const router = useRouter();

  const handleExerciseClick = (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      openExerciseModal(lesson.id, lesson.lessonNumber, lesson.kanjiList);
    }
  };

  const handleListClick = (lessonId: number) => {
    router.push(`/kanji/lesson?lessonId=${lessonId}&level=${selectedLevel}`);
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
      <KanjiExerciseModal />
    </div>
  );
}