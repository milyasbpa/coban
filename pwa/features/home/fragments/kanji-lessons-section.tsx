"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StrokeLessonCard } from "../components/stroke-lesson-card";
import { TopicLessonCard } from "../components/topic-lesson-card";
import { getLessonsByLevel } from "../utils/lesson";
import { getTopicLessons, getTopicCategories } from "../../kanji/lesson/utils/topic";
import { useHomeStore } from "../store/home-store";
import { KanjiExerciseModal } from "./kanji-exercise-modal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/pwa/core/components/tabs";
import { useHomeSettingsStore } from "../store/home-settings.store";

// Interface untuk Lesson
interface Lesson {
  id: number;
  level: string;
  lessonNumber: number;
  progress: number;
  kanjiList: string[];
}

export function KanjiLessonsSection() {
  const { selectedLevel, selectedLessonType } = useHomeSettingsStore();
  // Ambil lessons berdasarkan tipe yang dipilih
  const strokeLessons: Lesson[] = getLessonsByLevel(selectedLevel);
  const topicLessons = getTopicLessons(selectedLevel);
  
  const { openExerciseModal } = useHomeStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("1");

  const LESSONS_PER_TAB = 10;

  // Pilih data berdasarkan tipe lesson
  const currentLessons = selectedLessonType === "stroke" ? strokeLessons : [];
  const currentTopicLessons = selectedLessonType === "topic" ? topicLessons : [];

  // Bagi stroke lessons ke dalam tab-tab (pagination dengan limit 10)
  const lessonTabs = useMemo(() => {
    if (selectedLessonType !== "stroke") return [];
    
    const tabs = [];
    for (let i = 0; i < currentLessons.length; i += LESSONS_PER_TAB) {
      const tabLessons = currentLessons.slice(i, i + LESSONS_PER_TAB);
      const tabNumber = Math.floor(i / LESSONS_PER_TAB) + 1;
      const startLesson = i + 1;
      const endLesson = Math.min(i + LESSONS_PER_TAB, currentLessons.length);

      tabs.push({
        id: tabNumber.toString(),
        label: `${startLesson}-${endLesson}`,
        lessons: tabLessons,
      });
    }
    return tabs;
  }, [currentLessons, selectedLessonType]);

  // Bagi topic lessons ke dalam tab-tab (pagination dengan limit 10)  
  const topicTabs = useMemo(() => {
    if (selectedLessonType !== "topic") return [];
    
    const TOPICS_PER_TAB = 10;
    const tabs = [];
    for (let i = 0; i < currentTopicLessons.length; i += TOPICS_PER_TAB) {
      const tabTopics = currentTopicLessons.slice(i, i + TOPICS_PER_TAB);
      const tabNumber = Math.floor(i / TOPICS_PER_TAB) + 1;

      tabs.push({
        id: tabNumber.toString(),
        label: `Part ${tabNumber}`,
        topics: tabTopics,
      });
    }
    return tabs;
  }, [currentTopicLessons, selectedLessonType]);

  const handleExerciseClick = (lessonId: number) => {
    const lesson = currentLessons.find((l: Lesson) => l.id === lessonId);
    if (lesson) {
      openExerciseModal(lesson.id, lesson.lessonNumber, lesson.kanjiList);
    }
  };

  const handleListClick = (lessonId: number) => {
    router.push(`/kanji/lesson?lessonId=${lessonId}&level=${selectedLevel}`);
  };

  const handleTopicExerciseClick = (topicId: string) => {
    // Navigate to topic-based exercise
    router.push(`/kanji/exercise/pairing?topicId=${topicId}&level=${selectedLevel}`);
  };

  const handleTopicListClick = (topicId: string) => {
    // Navigate to topic-based lesson
    router.push(`/kanji/lesson?topicId=${topicId}&level=${selectedLevel}`);
  };

  // Render berdasarkan tipe yang dipilih
  if (selectedLessonType === "topic") {
    if (topicTabs.length === 0) {
      return (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            No topic lessons available for {selectedLevel}
          </p>
          <KanjiExerciseModal />
        </div>
      );
    }

    // Jika hanya ada 1 tab (topics <= 10), tampilkan tanpa tabs
    if (topicTabs.length === 1) {
      return (
        <div className="space-y-4">
          {topicTabs[0].topics.map((topic) => {
            const categories = getTopicCategories(selectedLevel);
            const category = categories[topic.id];
            return (
              <TopicLessonCard
                key={topic.id}
                level={selectedLevel}
                name={topic.name}
                progress={0} // You can implement progress tracking later
                kanjiList={category?.kanji_characters || []}
                onExerciseClick={() => handleTopicExerciseClick(topic.id)}
                onListClick={() => handleTopicListClick(topic.id)}
              />
            );
          })}
          <KanjiExerciseModal />
        </div>
      );
    }

    // Tampilkan dengan tabs jika topics > 10
    return (
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${topicTabs.length}, 1fr)` }}
          >
            {topicTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {topicTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              {tab.topics.map((topic) => {
                const categories = getTopicCategories(selectedLevel);
                const category = categories[topic.id];
                return (
                  <TopicLessonCard
                    key={topic.id}
                    level={selectedLevel}
                    name={topic.name}
                    progress={0} // You can implement progress tracking later
                    kanjiList={category?.kanji_characters || []}
                    onExerciseClick={() => handleTopicExerciseClick(topic.id)}
                    onListClick={() => handleTopicListClick(topic.id)}
                  />
                );
              })}
            </TabsContent>
          ))}
        </Tabs>

        <KanjiExerciseModal />
      </div>
    );
  }

  // Stroke lessons rendering
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
          <StrokeLessonCard
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
              <StrokeLessonCard
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
