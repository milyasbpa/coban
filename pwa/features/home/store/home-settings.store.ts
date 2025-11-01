import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HomeSettingsState {
  selectedLevel: string;
  selectedCategory: string;
  selectedLessonType: "stroke" | "topic";
  
  // Actions
  setSelectedLevel: (level: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedLessonType: (type: "stroke" | "topic") => void;
}

export const useHomeSettingsStore = create<HomeSettingsState>()(
  persist(
    (set) => ({
      // Default values
      selectedLevel: "N5",
      selectedCategory: "kanji",
      selectedLessonType: "stroke",
      
      // Actions
      setSelectedLevel: (level) => set({ selectedLevel: level }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedLessonType: (type) => set({ selectedLessonType: type }),
    }),
    {
      name: 'home-settings-storage', // localStorage key
      // Optional: customize storage
      // storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
    }
  )
);