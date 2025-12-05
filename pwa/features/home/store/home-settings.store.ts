import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FilterTab = "all" | "in-progress" | "finished";

interface HomeSettingsState {
  selectedLevel: string;
  selectedCategory: string;
  selectedLessonType: "stroke" | "topic";
  
  // Filter tabs per category/lesson type
  vocabularyFilterTab: FilterTab;
  kanjiStrokeFilterTab: FilterTab;
  kanjiTopicFilterTab: FilterTab;
  
  // Actions
  setSelectedLevel: (level: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedLessonType: (type: "stroke" | "topic") => void;
  
  // Filter actions
  setVocabularyFilterTab: (filter: FilterTab) => void;
  setKanjiStrokeFilterTab: (filter: FilterTab) => void;
  setKanjiTopicFilterTab: (filter: FilterTab) => void;
  
  // Reset filters when changing level/category
  resetFiltersForLevelChange: () => void;
  resetFiltersForCategoryChange: () => void;
}

export const useHomeSettingsStore = create<HomeSettingsState>()(
  persist(
    (set) => ({
      // Default values
      selectedLevel: "N5",
      selectedCategory: "kanji",
      selectedLessonType: "stroke",
      
      // Default filter tabs (all set to "all")
      vocabularyFilterTab: "all",
      kanjiStrokeFilterTab: "all",
      kanjiTopicFilterTab: "all",
      
      // Actions
      setSelectedLevel: (level) => {
        set({ selectedLevel: level });
        // Auto-reset filters when level changes
        set({
          vocabularyFilterTab: "all",
          kanjiStrokeFilterTab: "all",
          kanjiTopicFilterTab: "all",
        });
      },
      
      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
        // Auto-reset filters when category changes
        set({
          vocabularyFilterTab: "all",
          kanjiStrokeFilterTab: "all",
          kanjiTopicFilterTab: "all",
        });
      },
      
      setSelectedLessonType: (type) => set({ selectedLessonType: type }),
      
      // Filter actions
      setVocabularyFilterTab: (filter) => set({ vocabularyFilterTab: filter }),
      setKanjiStrokeFilterTab: (filter) => set({ kanjiStrokeFilterTab: filter }),
      setKanjiTopicFilterTab: (filter) => set({ kanjiTopicFilterTab: filter }),
      
      // Manual reset functions
      resetFiltersForLevelChange: () => set({
        vocabularyFilterTab: "all",
        kanjiStrokeFilterTab: "all",
        kanjiTopicFilterTab: "all",
      }),
      
      resetFiltersForCategoryChange: () => set({
        vocabularyFilterTab: "all",
        kanjiStrokeFilterTab: "all",
        kanjiTopicFilterTab: "all",
      }),
    }),
    {
      name: 'home-settings-storage', // localStorage key
      // Optional: customize storage
      // storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
    }
  )
);