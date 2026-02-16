"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GrammarLessonCard } from "../components/grammar-lesson-card";
import { GrammarService } from "@/pwa/core/services/grammar";
import { useHomeStore } from "../store/home-store";
import { GrammarExerciseModal } from "./grammar-exercise-modal";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/pwa/core/components/tabs";
import { useHomeSettingsStore } from "../store/home-settings.store";
import { useGrammarScoreStore } from "@/pwa/features/score/store/grammar-score.store";

interface GrammarLessonSectionProps {
  showProgress?: boolean;
}

export function GrammarLessonSection({
  showProgress = false,
}: GrammarLessonSectionProps) {
  const { selectedLevel, grammarPaginationTab, setGrammarPaginationTab } = useHomeSettingsStore();
  const { openGrammarExerciseModal } = useHomeStore();
  const { getPatternProgress } = useGrammarScoreStore();
  const router = useRouter();

  const PATTERNS_PER_TAB = 10;

  // Get all grammar patterns for the selected level
  const allPatterns = useMemo(
    () => GrammarService.getAllPatternsByLevel(selectedLevel),
    [selectedLevel]
  );

  // Divide patterns into tabs (pagination with limit 10)
  const patternTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < allPatterns.length; i += PATTERNS_PER_TAB) {
      const tabPatterns = allPatterns.slice(i, i + PATTERNS_PER_TAB);
      const tabNumber = Math.floor(i / PATTERNS_PER_TAB) + 1;

      tabs.push({
        id: tabNumber.toString(),
        label: `Part ${tabNumber}`,
        patterns: tabPatterns,
      });
    }
    return tabs;
  }, [allPatterns]);

  // Validate pagination tab - fallback to "1" if stored tab doesn't exist
  const validatedPaginationTab = useMemo(() => {
    const tabExists = patternTabs.some(tab => tab.id === grammarPaginationTab);
    return tabExists ? grammarPaginationTab : "1";
  }, [patternTabs, grammarPaginationTab]);

  // Reset stored pagination if validation failed
  useEffect(() => {
    if (validatedPaginationTab !== grammarPaginationTab) {
      setGrammarPaginationTab("1");
    }
  }, [validatedPaginationTab, grammarPaginationTab, setGrammarPaginationTab]);

  // Handle exercise click
  const handleGrammarExerciseClick = (patternId: number) => {
    const pattern = allPatterns.find((p) => p.id === patternId);
    if (pattern) {
      openGrammarExerciseModal({
        patternId: patternId.toString(),
        patternName: pattern.japanese,
        pattern: pattern,
        level: selectedLevel,
      });
    }
  };

  // Handle lesson/list click
  const handleGrammarListClick = (patternId: number) => {
    // Navigate to grammar lesson detail page
    router.push(
      `/grammar/lesson?patternId=${patternId}&level=${selectedLevel}`
    );
  };

  // No patterns available
  if (patternTabs.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">
          No grammar patterns available for {selectedLevel}
        </p>
        <GrammarExerciseModal showProgress={showProgress} />
      </div>
    );
  }

  // If only 1 tab (patterns <= 10), display without tabs
  if (patternTabs.length === 1) {
    return (
      <div className="space-y-4">
        {patternTabs[0].patterns.map((pattern, index) => (
          <GrammarLessonCard
            key={pattern.id}
            level={selectedLevel}
            lessonNumber={index + 1}
            pattern={pattern.romanji}
            japanese={pattern.japanese}
            categoryName={pattern.category.name.en}
            progress={getPatternProgress(pattern.id.toString(), selectedLevel)}
            onExerciseClick={() => handleGrammarExerciseClick(pattern.id)}
            onListClick={() => handleGrammarListClick(pattern.id)}
            showProgress={showProgress}
          />
        ))}
        <GrammarExerciseModal showProgress={showProgress} />
      </div>
    );
  }

  // Display with tabs if patterns > 10
  return (
    <div className="space-y-4">
      <Tabs value={validatedPaginationTab} onValueChange={setGrammarPaginationTab} className="w-full">
        <TabsList
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${patternTabs.length}, 1fr)`,
          }}
        >
          {patternTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {patternTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.patterns.map((pattern, index) => {
              // Calculate pattern number across all tabs
              const tabIndex = parseInt(tab.id) - 1;
              const patternNumber = tabIndex * PATTERNS_PER_TAB + index + 1;

              return (
                <GrammarLessonCard
                  key={pattern.id}
                  level={selectedLevel}
                  lessonNumber={patternNumber}
                  pattern={pattern.romanji}
                  japanese={pattern.japanese}
                  categoryName={pattern.category.name.en}
                  progress={getPatternProgress(
                    pattern.id.toString(),
                    selectedLevel
                  )}
                  onExerciseClick={() => handleGrammarExerciseClick(pattern.id)}
                  onListClick={() => handleGrammarListClick(pattern.id)}
                  showProgress={showProgress}
                />
              );
            })}
          </TabsContent>
        ))}
      </Tabs>

      <GrammarExerciseModal showProgress={showProgress} />
    </div>
  );
}
