import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FilterTab = "all" | "in-progress" | "finished";

interface HomeSettingsState {
  selectedLevel: string;
  selectedCategory: string;
  
  // Filter tabs per category/lesson type
  vocabularyFilterTab: FilterTab;
  kanjiStrokeFilterTab: FilterTab;
  
  // Pagination tabs per category
  kanjiPaginationTab: string;
  vocabularyPaginationTab: string;
  grammarPaginationTab: string;
  
  // Actions
  setSelectedLevel: (level: string) => void;
  setSelectedCategory: (category: string) => void;
  
  // Filter actions
  setVocabularyFilterTab: (filter: FilterTab) => void;
  setKanjiStrokeFilterTab: (filter: FilterTab) => void;
  
  // Pagination actions
  setKanjiPaginationTab: (tab: string) => void;
  setVocabularyPaginationTab: (tab: string) => void;
  setGrammarPaginationTab: (tab: string) => void;
  
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
      
      // Default filter tabs (all set to "all")
      vocabularyFilterTab: "all",
      kanjiStrokeFilterTab: "all",
      
      // Default pagination tabs (all set to "1")
      kanjiPaginationTab: "1",
      vocabularyPaginationTab: "1",
      grammarPaginationTab: "1",
      
      // Actions
      setSelectedLevel: (level) => {
        set({ selectedLevel: level });
        // Auto-reset filters and pagination when level changes
        set({
          vocabularyFilterTab: "all",
          kanjiStrokeFilterTab: "all",
          kanjiPaginationTab: "1",
          vocabularyPaginationTab: "1",
          grammarPaginationTab: "1",
        });
      },
      
      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
        // Auto-reset filters and pagination when category changes
        set({
          vocabularyFilterTab: "all",
          kanjiStrokeFilterTab: "all",
          kanjiPaginationTab: "1",
          vocabularyPaginationTab: "1",
          grammarPaginationTab: "1",
        });
      },
      
      // Filter actions
      setVocabularyFilterTab: (filter) => {
        set({ vocabularyFilterTab: filter });
        // Reset pagination when filter changes
        set({ vocabularyPaginationTab: "1" });
      },
      setKanjiStrokeFilterTab: (filter) => {
        set({ kanjiStrokeFilterTab: filter });
        // Reset pagination when filter changes
        set({ kanjiPaginationTab: "1" });
      },
      
      // Pagination actions
      setKanjiPaginationTab: (tab) => set({ kanjiPaginationTab: tab }),
      setVocabularyPaginationTab: (tab) => set({ vocabularyPaginationTab: tab }),
      setGrammarPaginationTab: (tab) => set({ grammarPaginationTab: tab }),
      
      // Manual reset functions
      resetFiltersForLevelChange: () => set({
        vocabularyFilterTab: "all",
        kanjiStrokeFilterTab: "all",
        kanjiPaginationTab: "1",
        vocabularyPaginationTab: "1",
        grammarPaginationTab: "1",
      }),
      
      resetFiltersForCategoryChange: () => set({
        vocabularyFilterTab: "all",
        kanjiStrokeFilterTab: "all",
        kanjiPaginationTab: "1",
        vocabularyPaginationTab: "1",
        grammarPaginationTab: "1",
      }),
    }),
    {
      name: 'home-settings-storage', // localStorage key
      // Optional: customize storage
      // storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
    }
  )
);