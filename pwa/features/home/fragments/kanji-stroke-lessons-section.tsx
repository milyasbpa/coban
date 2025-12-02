"use client";

import { useState, useMemo, useEffect } from "react";
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

interface KanjiStrokeLessonsSectionProps {
  showProgress?: boolean;
}

export function KanjiStrokeLessonsSection({ showProgress = false }: KanjiStrokeLessonsSectionProps) {
  const { selectedLevel } = useHomeSettingsStore();
  const { openKanjiExerciseModal } = useHomeStore();
  const { getLessonProgress } = useKanjiScoreStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("1");

  // Reset to tab 1 when selected level changed
  useEffect(() => {
    setActiveTab("1");
  }, [selectedLevel]);

  const LESSONS_PER_TAB = 10;

  // Ambil stroke lessons berdasarkan level yang dipilih
  const strokeLessons: Lesson[] = getLessonsByLevel(selectedLevel);

  // Sort lessons by progress before pagination
  const sortedLessons = useMemo(() => {
    return [...strokeLessons].sort((a, b) => {
      const progressA = getLessonProgress(a.id.toString(), selectedLevel);
      const progressB = getLessonProgress(b.id.toString(), selectedLevel);
      
      // Group 1: Completed (100%) - at bottom
      if (progressA === 100 && progressB === 100) {
        return a.id - b.id; // Both completed, sort by ID
      }
      if (progressA === 100) return 1; // A completed, push down
      if (progressB === 100) return -1; // B completed, push down
      
      // Group 2: Not started (0%) - in middle
      if (progressA === 0 && progressB === 0) {
        return a.id - b.id; // Both not started, sort by ID
      }
      if (progressA === 0) return 1; // A not started, lower priority
      if (progressB === 0) return -1; // B not started, lower priority
      
      // Group 3: In progress (1-99%) - at top, higher progress first
      return progressB - progressA;
    });
  }, [strokeLessons, selectedLevel, getLessonProgress]);

  // Bagi stroke lessons ke dalam tab-tab (pagination dengan limit 10)
  const lessonTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < sortedLessons.length; i += LESSONS_PER_TAB) {
      const tabLessons = sortedLessons.slice(i, i + LESSONS_PER_TAB);
      const tabNumber = Math.floor(i / LESSONS_PER_TAB) + 1;
      const startLesson = i + 1;
      const endLesson = Math.min(i + LESSONS_PER_TAB, sortedLessons.length);

      tabs.push({
        id: tabNumber.toString(),
        label: `${startLesson}-${endLesson}`,
        lessons: tabLessons,
      });
    }
    return tabs;
  }, [sortedLessons]);

  // Handle exercise click for stroke-based lessons
  const handleExerciseClick = (lessonId: number) => {
    const lesson = strokeLessons.find((l: Lesson) => l.id === lessonId);
    if (lesson) {
      // Extract kanji characters from the new lesson structure
      const kanjiCharacters = lesson.kanji.map((k) => k.character);

      openKanjiExerciseModal({
        lessonId: lesson.id,
        lessonType: "stroke",
        lessonName: `Lesson ${lesson.lessonNumber}`,
        kanjiList: kanjiCharacters,
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
            progress={getLessonProgress(lesson.id.toString(), selectedLevel)}
            kanjiList={lesson.kanji.map((k) => k.character)}
            onExerciseClick={() => handleExerciseClick(lesson.id)}
            onListClick={() => handleListClick(lesson.id)}
            showProgress={showProgress}
          />
        ))}
        <KanjiExerciseModal showProgress={showProgress} />
      </div>
    );
  }

  // Tampilkan dengan tabs jika lessons > 10
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList
            className={`
              ${lessonTabs.length <= 4 ? "grid w-full" : "flex gap-1 w-max"}
            `}
            style={
              lessonTabs.length <= 4
                ? { gridTemplateColumns: `repeat(${lessonTabs.length}, 1fr)` }
                : undefined
            }
          >
            {lessonTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  text-xs whitespace-nowrap
                  ${lessonTabs.length > 4 ? "min-w-[100px] px-4" : ""}
                `}
              >
                Lessons {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {lessonTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.lessons.map((lesson: Lesson) => (
              <KanjiStrokeLessonCard
                key={lesson.id}
                level={lesson.level}
                lessonNumber={lesson.lessonNumber}
                progress={getLessonProgress(lesson.id.toString(), selectedLevel)}
                kanjiList={lesson.kanji.map((k) => k.character)}
                onExerciseClick={() => handleExerciseClick(lesson.id)}
                onListClick={() => handleListClick(lesson.id)}
                showProgress={showProgress}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <KanjiExerciseModal showProgress={showProgress} />
    </div>
  );
}
