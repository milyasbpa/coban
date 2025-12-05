"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KanjiTopicLessonCard } from "../components/kanji-topic-lesson-card";
import { getTopicLessons } from "../../kanji/lesson/utils/topic";
import { KanjiService, KanjiDetail } from "@/pwa/core/services/kanji";
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

interface KanjiTopicLessonsSectionProps {
  showProgress?: boolean;
}

export function KanjiTopicLessonsSection({ showProgress = false }: KanjiTopicLessonsSectionProps) {
  const { selectedLevel, kanjiTopicFilterTab, setKanjiTopicFilterTab } = useHomeSettingsStore();
  const { openKanjiExerciseModal } = useHomeStore();
  const { getLessonProgress, isInitialized } = useKanjiScoreStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("1");

  // Reset to tab 1 when selected level changed
  useEffect(() => {
    setActiveTab("1");
  }, [selectedLevel]);

  const TOPICS_PER_TAB = 10;

  // Ambil topic lessons berdasarkan level yang dipilih
  const topicLessons = getTopicLessons(selectedLevel);

  // Sort topics by progress before pagination
  const sortedTopics = useMemo(() => {
    return [...topicLessons].sort((a, b) => {
      const progressA = getLessonProgress(`topic_${a.id}`, selectedLevel);
      const progressB = getLessonProgress(`topic_${b.id}`, selectedLevel);
      
      // Group 1: Completed (100%) - at bottom
      if (progressA === 100 && progressB === 100) {
        return a.id.localeCompare(b.id); // Both completed, sort by ID
      }
      if (progressA === 100) return 1; // A completed, push down
      if (progressB === 100) return -1; // B completed, push down
      
      // Group 2: Not started (0%) - in middle
      if (progressA === 0 && progressB === 0) {
        return a.id.localeCompare(b.id); // Both not started, sort by ID
      }
      if (progressA === 0) return 1; // A not started, lower priority
      if (progressB === 0) return -1; // B not started, lower priority
      
      // Group 3: In progress (1-99%) - at top, higher progress first
      return progressB - progressA;
    });
  }, [topicLessons, selectedLevel, getLessonProgress, isInitialized]);

  // Apply filter based on selected filter tab
  const filteredTopics = useMemo(() => {
    if (kanjiTopicFilterTab === "all") {
      return sortedTopics;
    } else if (kanjiTopicFilterTab === "in-progress") {
      return sortedTopics.filter((topic) => {
        const progress = getLessonProgress(`topic_${topic.id}`, selectedLevel);
        return progress > 0 && progress < 100;
      });
    } else if (kanjiTopicFilterTab === "finished") {
      return sortedTopics.filter((topic) => {
        const progress = getLessonProgress(`topic_${topic.id}`, selectedLevel);
        return progress === 100;
      }).sort((a, b) => a.id.localeCompare(b.id)); // Sort finished by ID
    }
    return sortedTopics;
  }, [sortedTopics, kanjiTopicFilterTab, selectedLevel, getLessonProgress]);

  // Bagi topic lessons ke dalam tab-tab (pagination dengan limit 10)
  const topicTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < filteredTopics.length; i += TOPICS_PER_TAB) {
      const tabTopics = filteredTopics.slice(i, i + TOPICS_PER_TAB);
      const tabNumber = Math.floor(i / TOPICS_PER_TAB) + 1;

      tabs.push({
        id: tabNumber.toString(),
        label: `Part ${tabNumber}`,
        topics: tabTopics,
      });
    }
    return tabs;
  }, [filteredTopics]);

  // Reset to Part 1 when filter changes
  const handleFilterChange = (value: string) => {
    setKanjiTopicFilterTab(value as "all" | "in-progress" | "finished");
    setActiveTab("1");
  };

  // Handle exercise click for topic-based lessons
  const handleTopicExerciseClick = (topicId: string) => {
    // Find topic data and get kanji list
    const topic = topicLessons.find((t) => t.id === topicId);
    if (topic) {
      const categories = KanjiService.getTopicCategories(selectedLevel);
      const category = categories[topicId];
      
      // Get full kanji objects using IDs
      const kanjiIds = category?.kanji_ids || [];
      const kanjiList = kanjiIds
        .map(id => KanjiService.getKanjiById(id, selectedLevel))
        .filter((k): k is KanjiDetail => k !== null);

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

  // No topic lessons available at all (raw data is empty)
  if (topicLessons.length === 0) {
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
        {/* Filter Tabs */}
        <Tabs value={kanjiTopicFilterTab} onValueChange={handleFilterChange} className="w-full">
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
        {topicTabs[0].topics.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {kanjiTopicFilterTab === "finished"
                ? "No completed lessons yet. Keep learning! 💪"
                : kanjiTopicFilterTab === "in-progress"
                ? "No lessons in progress. Start learning now! 🚀"
                : "No lessons available"}
            </p>
          </div>
        ) : (
          <>
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
              showProgress={showProgress}
            />
          );
            })}
          </>
        )}
        <KanjiExerciseModal showProgress={showProgress} />
      </div>
    );
  }

  // Tampilkan dengan tabs jika topics > 10
  return (
      <div className="space-y-4">
      {/* Filter Tabs */}
      <Tabs value={kanjiTopicFilterTab} onValueChange={handleFilterChange} className="w-full">
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList
            className={`
              ${topicTabs.length <= 4 
                ? 'grid w-full bg-muted/50' 
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
            {tab.topics.length === 0 ? (
                  <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {kanjiTopicFilterTab === "finished"
                    ? "No completed lessons in this part yet. Keep learning! 💪"
                    : kanjiTopicFilterTab === "in-progress"
                    ? "No lessons in progress in this part. Start learning now! 🚀"
                    : "No lessons available in this part"}
                </p>
              </div>
            ) : (
              <>
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
                  showProgress={showProgress}
                />
              );
                })}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <KanjiExerciseModal showProgress={showProgress} />
    </div>
  );
}
