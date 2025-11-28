"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VocabularyLessonCard } from "../components/vocabulary-lesson-card";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { useHomeStore } from "../store/home-store";
import { VocabularyExerciseModal } from "./vocabulary-exercise-modal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/pwa/core/components/tabs";
import { useHomeSettingsStore } from "../store/home-settings.store";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { titleCase } from "@/pwa/core/lib/utils/titleCase";

export function VocabularyLessonSection() {
  const { selectedLevel } = useHomeSettingsStore();
  const { openVocabularyExerciseModal } = useHomeStore();
  const { getCategoryProgress } = useVocabularyScoreStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("1");

  const CATEGORIES_PER_TAB = 10;

  // Get vocabulary categories based on selected level
  const vocabularyCategories =
    VocabularyService.getVocabularyCategories(selectedLevel);

  // Divide vocabulary categories into tabs (pagination with limit 10)
  const categoryTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < vocabularyCategories.length; i += CATEGORIES_PER_TAB) {
      const tabCategories = vocabularyCategories.slice(
        i,
        i + CATEGORIES_PER_TAB
      );
      const tabNumber = Math.floor(i / CATEGORIES_PER_TAB) + 1;

      tabs.push({
        id: tabNumber.toString(),
        label: `Part ${tabNumber}`,
        categories: tabCategories,
      });
    }
    return tabs;
  }, [vocabularyCategories]);

  // Handle exercise click for vocabulary categories
  const handleVocabularyExerciseClick = (categoryId: number) => {
    const category = vocabularyCategories.find((cat) => cat.id === categoryId);
    if (category) {
      openVocabularyExerciseModal({
        categoryId: categoryId.toString(),
        categoryName: category.category.en,
        vocabularyList: category.vocabulary,
        level: selectedLevel,
      });
    }
  };

  const handleVocabularyListClick = (categoryId: number) => {
    // Navigate to vocabulary lesson
    router.push(
      `/vocabulary/lesson?categoryId=${categoryId}&level=${selectedLevel}`
    );
  };

  // No vocabulary categories available
  if (categoryTabs.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          No vocabulary lessons available for {selectedLevel}
        </p>
        <VocabularyExerciseModal />
      </div>
    );
  }

  // If only 1 tab (categories <= 10), display without tabs
  if (categoryTabs.length === 1) {
    return (
      <div className="space-y-4">
        {categoryTabs[0].categories.map((category, index) => (
          <VocabularyLessonCard
            key={category.id}
            level={selectedLevel}
            lessonNumber={index + 1}
            title={titleCase(category.category.en)}
            wordCount={category.vocabulary.length}
            progress={getCategoryProgress(category.id.toString(), selectedLevel)}
            onExerciseClick={() => handleVocabularyExerciseClick(category.id)}
            onListClick={() => handleVocabularyListClick(category.id)}
          />
        ))}
        <VocabularyExerciseModal />
      </div>
    );
  }

  // Display with tabs if categories > 10
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${categoryTabs.length}, 1fr)` }}
        >
          {categoryTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categoryTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.categories.map((category, index) => {
              // Calculate lesson number across all tabs
              const tabIndex = parseInt(tab.id) - 1;
              const lessonNumber = tabIndex * CATEGORIES_PER_TAB + index + 1;

              return (
                <VocabularyLessonCard
                  key={category.id}
                  level={selectedLevel}
                  lessonNumber={lessonNumber}
                  title={category.category.en}
                  wordCount={category.vocabulary.length}
                  progress={getCategoryProgress(category.id.toString(), selectedLevel)}
                  onExerciseClick={() =>
                    handleVocabularyExerciseClick(category.id)
                  }
                  onListClick={() => handleVocabularyListClick(category.id)}
                />
              );
            })}
          </TabsContent>
        ))}
      </Tabs>

      <VocabularyExerciseModal />
    </div>
  );
}
