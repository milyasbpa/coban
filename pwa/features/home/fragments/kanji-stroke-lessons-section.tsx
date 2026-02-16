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
  const { selectedLevel, kanjiStrokeFilterTab, setKanjiStrokeFilterTab, kanjiPaginationTab, setKanjiPaginationTab } = useHomeSettingsStore();
  const { openKanjiExerciseModal } = useHomeStore();
  const { getLessonProgress, isInitialized } = useKanjiScoreStore();
  const router = useRouter();

  const LESSONS_PER_TAB = 10;

  // Ambil stroke lessons berdasarkan level yang dipilih
  const strokeLessons: Lesson[] = getLessonsByLevel(selectedLevel);

  // Apply filter based on selected filter tab
  const filteredLessons = useMemo(() => {
    if (kanjiStrokeFilterTab === "all") {
      // For "all" tab: sort by lesson ID only (no progress sorting)
      return [...strokeLessons].sort((a, b) => a.id - b.id);
    } else if (kanjiStrokeFilterTab === "in-progress") {
      // For "in-progress" tab: sort by progress (higher progress first)
      return [...strokeLessons]
        .filter((lesson) => {
          const progress = getLessonProgress(lesson.id.toString(), selectedLevel);
          return progress > 0 && progress < 100;
        })
        .sort((a, b) => {
          const progressA = getLessonProgress(a.id.toString(), selectedLevel);
          const progressB = getLessonProgress(b.id.toString(), selectedLevel);
          return progressB - progressA; // Higher progress first
        });
    } else if (kanjiStrokeFilterTab === "finished") {
      // For "finished" tab: sort by lesson ID
      return [...strokeLessons]
        .filter((lesson) => {
          const progress = getLessonProgress(lesson.id.toString(), selectedLevel);
          return progress === 100;
        })
        .sort((a, b) => a.id - b.id);
    }
    return [...strokeLessons].sort((a, b) => a.id - b.id);
  }, [strokeLessons, kanjiStrokeFilterTab, selectedLevel, getLessonProgress, isInitialized]);

  // Bagi stroke lessons ke dalam tab-tab (pagination dengan limit 10)
  const lessonTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < filteredLessons.length; i += LESSONS_PER_TAB) {
      const tabLessons = filteredLessons.slice(i, i + LESSONS_PER_TAB);
      const tabNumber = Math.floor(i / LESSONS_PER_TAB) + 1;
      const startLesson = i + 1;
      const endLesson = Math.min(i + LESSONS_PER_TAB, filteredLessons.length);

      tabs.push({
        id: tabNumber.toString(),
        label: `${startLesson}-${endLesson}`,
        lessons: tabLessons,
      });
    }
    return tabs;
  }, [filteredLessons]);

  // Validate pagination tab - fallback to "1" if stored tab doesn't exist
  const validatedPaginationTab = useMemo(() => {
    const tabExists = lessonTabs.some(tab => tab.id === kanjiPaginationTab);
    return tabExists ? kanjiPaginationTab : "1";
  }, [lessonTabs, kanjiPaginationTab]);

  // Reset stored pagination if validation failed
  useEffect(() => {
    if (validatedPaginationTab !== kanjiPaginationTab) {
      setKanjiPaginationTab("1");
    }
  }, [validatedPaginationTab, kanjiPaginationTab, setKanjiPaginationTab]);

  // Filter changes already handled by store (auto-resets pagination)

  // Handle exercise click for stroke-based lessons
  const handleExerciseClick = (lessonId: number) => {
    const lesson = strokeLessons.find((l: Lesson) => l.id === lessonId);
    if (lesson) {
      openKanjiExerciseModal({
        lessonId: lesson.id,
        lessonName: `Lesson ${lesson.lessonNumber}`,
        kanjiList: lesson.kanji, // Pass full kanji objects
      });
    }
  };

  const handleListClick = (lessonId: number) => {
    router.push(`/kanji/lesson?lessonId=${lessonId}&level=${selectedLevel}`);
  };

  // No lessons available at all (raw data is empty)
  if (strokeLessons.length === 0) {
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
        {/* Filter Tabs */}
        <Tabs value={kanjiStrokeFilterTab} onValueChange={(value) => setKanjiStrokeFilterTab(value as "all" | "in-progress" | "finished")} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="text-xs">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="finished" className="text-xs">
              Finished
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Empty State */}
        {lessonTabs[0].lessons.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {kanjiStrokeFilterTab === "finished"
                ? "No completed lessons yet. Keep learning! 💪"
                : kanjiStrokeFilterTab === "in-progress"
                ? "No lessons in progress. Start learning now! 🚀"
                : "No lessons available"}
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
        <KanjiExerciseModal showProgress={showProgress} />
      </div>
    );
  }

  // Tampilkan dengan tabs jika lessons > 10
  return (
      <div className="space-y-4">
      {/* Filter Tabs */}
      <Tabs value={kanjiStrokeFilterTab} onValueChange={(value) => setKanjiStrokeFilterTab(value as "all" | "in-progress" | "finished")} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm">
            In Progress
          </TabsTrigger>
          <TabsTrigger value="finished" className="text-xs sm:text-sm">
            Finished
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Pagination Tabs */}
      <Tabs value={validatedPaginationTab} onValueChange={setKanjiPaginationTab} className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList
            className={`
              ${lessonTabs.length <= 4 ? "grid w-full bg-muted/50" : "flex gap-1 w-max"}
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
            {tab.lessons.length === 0 ? (
                  <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {kanjiStrokeFilterTab === "finished"
                    ? "No completed lessons in this part yet. Keep learning! 💪"
                    : kanjiStrokeFilterTab === "in-progress"
                    ? "No lessons in progress in this part. Start learning now! 🚀"
                    : "No lessons available in this part"}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <KanjiExerciseModal showProgress={showProgress} />
    </div>
  );
}
