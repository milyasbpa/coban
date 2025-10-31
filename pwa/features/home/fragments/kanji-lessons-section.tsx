"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LessonCard } from "../components/lesson-card";
import { getLessonsByLevel } from "../utils/lesson";
import { useHomeStore } from "../store/home-store";
import { KanjiExerciseModal } from "./kanji-exercise-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pwa/core/components/tabs";

// Interface untuk Lesson
interface Lesson {
  id: number;
  level: string;
  lessonNumber: number;
  progress: number;
  kanjiList: string[];
}

interface KanjiLessonsSectionProps {
  selectedLevel?: string;
}

export function KanjiLessonsSection({ selectedLevel = "N5" }: KanjiLessonsSectionProps) {
  // Ambil lessons berdasarkan level yang dipilih
  const lessons: Lesson[] = getLessonsByLevel(selectedLevel);
  const { openExerciseModal } = useHomeStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("1");

  const LESSONS_PER_TAB = 10;

  // Bagi lessons ke dalam tab-tab (pagination dengan limit 10)
  const lessonTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < lessons.length; i += LESSONS_PER_TAB) {
      const tabLessons = lessons.slice(i, i + LESSONS_PER_TAB);
      const tabNumber = Math.floor(i / LESSONS_PER_TAB) + 1;
      const startLesson = i + 1;
      const endLesson = Math.min(i + LESSONS_PER_TAB, lessons.length);
      
      tabs.push({
        id: tabNumber.toString(),
        label: `${startLesson}-${endLesson}`,
        lessons: tabLessons
      });
    }
    return tabs;
  }, [lessons]);

  const handleExerciseClick = (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      openExerciseModal(lesson.id, lesson.lessonNumber, lesson.kanjiList);
    }
  };

  const handleListClick = (lessonId: number) => {
    router.push(`/kanji/lesson?lessonId=${lessonId}&level=${selectedLevel}`);
  };

  if (lessonTabs.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">No lessons available for {selectedLevel}</p>
        <KanjiExerciseModal />
      </div>
    );
  }

  // Jika hanya ada 1 tab (lessons <= 10), tampilkan tanpa tabs
  if (lessonTabs.length === 1) {
    return (
      <div className="space-y-4">
        {lessonTabs[0].lessons.map((lesson: Lesson) => (
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

  // Tampilkan dengan tabs jika lessons > 10
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${lessonTabs.length}, 1fr)` }}>
          {lessonTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              Lessons {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {lessonTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.lessons.map((lesson: Lesson) => (
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
          </TabsContent>
        ))}
      </Tabs>
      
      <KanjiExerciseModal />
    </div>
  );
}