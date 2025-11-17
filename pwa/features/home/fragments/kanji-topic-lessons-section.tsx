"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KanjiTopicLessonCard } from "../components/kanji-topic-lesson-card";
import { getTopicLessons } from "../../kanji/lesson/utils/topic";
import { KanjiService } from "@/pwa/core/services/kanji";
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

export function KanjiTopicLessonsSection() {
  const { selectedLevel } = useHomeSettingsStore();
  const { openKanjiExerciseModal } = useHomeStore();
  const { getLessonProgress } = useKanjiScoreStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("1");

  // Reset to tab 1 when selected level changed
  useEffect(() => {
    setActiveTab("1");
  }, [selectedLevel]);

  const TOPICS_PER_TAB = 10;

  // Ambil topic lessons berdasarkan level yang dipilih
  const topicLessons = getTopicLessons(selectedLevel);

  // Bagi topic lessons ke dalam tab-tab (pagination dengan limit 10)
  const topicTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < topicLessons.length; i += TOPICS_PER_TAB) {
      const tabTopics = topicLessons.slice(i, i + TOPICS_PER_TAB);
      const tabNumber = Math.floor(i / TOPICS_PER_TAB) + 1;

      tabs.push({
        id: tabNumber.toString(),
        label: `Part ${tabNumber}`,
        topics: tabTopics,
      });
    }
    return tabs;
  }, [topicLessons]);

  // Handle exercise click for topic-based lessons
  const handleTopicExerciseClick = (topicId: string) => {
    // Find topic data and get kanji list
    const topic = topicLessons.find((t) => t.id === topicId);
    if (topic) {
      const categories = KanjiService.getTopicCategories(selectedLevel);
      const category = categories[topicId];
      const kanjiList = category?.kanji_characters || [];

      openKanjiExerciseModal({
        topicId: topicId,
        lessonType: "topic",
        lessonName: topic.name || category?.name || topicId,
        kanjiList: kanjiList,
      });
    }
  };

  const handleTopicListClick = (topicId: string) => {
    // Navigate to topic-based lesson
    router.push(`/kanji/lesson?topicId=${topicId}&level=${selectedLevel}`);
  };

  // No topic lessons available
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
          const categories = KanjiService.getTopicCategories(selectedLevel);
          const category = categories[topic.id];
          return (
            <KanjiTopicLessonCard
              key={topic.id}
              level={selectedLevel}
              name={topic.name}
              progress={getLessonProgress(`topic_${topic.id}`, selectedLevel)}
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
        <div className="w-full overflow-x-auto">
          <TabsList
            className={`
              ${topicTabs.length <= 4 
                ? 'grid w-full' 
                : 'flex gap-1 w-max'
              }
            `}
            style={topicTabs.length <= 4 
              ? { gridTemplateColumns: `repeat(${topicTabs.length}, 1fr)` }
              : undefined
            }
          >
            {topicTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className={`
                  text-xs whitespace-nowrap
                  ${topicTabs.length > 4 ? 'min-w-[100px] px-4' : ''}
                `}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {topicTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.topics.map((topic) => {
              const categories = KanjiService.getTopicCategories(selectedLevel);
              const category = categories[topic.id];
              return (
                <KanjiTopicLessonCard
                  key={topic.id}
                  level={selectedLevel}
                  name={topic.name}
                  progress={getLessonProgress(`topic_${topic.id}`, selectedLevel)}
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
