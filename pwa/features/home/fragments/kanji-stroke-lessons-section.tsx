"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { KanjiStrokeLessonCard } from "../components/kanji-stroke-lesson-card";
import { getLessonsByLevel, Lesson } from "../utils/lesson";
import { useHomeStore } from "../store/home-store";
import { KanjiExerciseModal } from "./kanji-exercise-modal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/pwa/core/components/tabs";
import { useHomeSettingsStore } from "../store/home-settings.store";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";

export function KanjiStrokeLessonsSection() {
  const { selectedLevel } = useHomeSettingsStore();
  const { openKanjiExerciseModal } = useHomeStore();
  const { getLessonProgress } = useKanjiScoreStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("1");

  const LESSONS_PER_TAB = 10;

  // Ambil stroke lessons berdasarkan level yang dipilih
  const strokeLessons: Lesson[] = getLessonsByLevel(selectedLevel);

  // Bagi stroke lessons ke dalam tab-tab (pagination dengan limit 10)
  const lessonTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < strokeLessons.length; i += LESSONS_PER_TAB) {
      const tabLessons = strokeLessons.slice(i, i + LESSONS_PER_TAB);
      const tabNumber = Math.floor(i / LESSONS_PER_TAB) + 1;
      const startLesson = i + 1;
      const endLesson = Math.min(i + LESSONS_PER_TAB, strokeLessons.length);

      tabs.push({
        id: tabNumber.toString(),
        label: `${startLesson}-${endLesson}`,
        lessons: tabLessons,
      });
    }
    return tabs;
  }, [strokeLessons]);

  // Handle exercise click for stroke-based lessons
  const handleExerciseClick = (lessonId: number) => {
    const lesson = strokeLessons.find((l: Lesson) => l.id === lessonId);
    if (lesson) {
      // Extract kanji characters from the new lesson structure
      const kanjiCharacters = lesson.kanji.map(k => k.character);
      
      openKanjiExerciseModal({
        lessonId: lesson.id,
        lessonType: "stroke",
        lessonName: `Lesson ${lesson.lessonNumber}`,
        kanjiList: kanjiCharacters
      });
    }
  };

  const handleListClick = (lessonId: number) => {
    router.push(`/kanji/lesson?lessonId=${lessonId}&level=${selectedLevel}`);
  };

  // No lessons available
  if (lessonTabs.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          No lessons available for {selectedLevel}
        </p>
        <KanjiExerciseModal />
      </div>
    );
  }

  // Jika hanya ada 1 tab (lessons <= 10), tampilkan tanpa tabs
  if (lessonTabs.length === 1) {
    return (
      <div className="space-y-4">
        {lessonTabs[0].lessons.map((lesson: Lesson) => (
          <KanjiStrokeLessonCard
            key={lesson.id}
            level={lesson.level}
            lessonNumber={lesson.lessonNumber}
            progress={getLessonProgress(lesson.id.toString())}
            kanjiList={lesson.kanji.map(k => k.character)}
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
        <TabsList
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${lessonTabs.length}, 1fr)` }}
        >
          {lessonTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              Lessons {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {lessonTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.lessons.map((lesson: Lesson) => (
              <KanjiStrokeLessonCard
                key={lesson.id}
                level={lesson.level}
                lessonNumber={lesson.lessonNumber}
                progress={getLessonProgress(lesson.id.toString())}
                kanjiList={lesson.kanji.map(k => k.character)}
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