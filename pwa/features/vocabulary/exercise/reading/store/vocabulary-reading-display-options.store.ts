import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VocabularyReadingDisplayState {
  // Display options for vocabulary reading
  displayHiragana: boolean;
  displayRomaji: boolean;
  displayKanji: boolean;

  // Actions
  toggleHiragana: () => void;
  toggleRomaji: () => void;
  toggleKanji: () => void;
  resetToDefault: () => void;
}

export const useVocabularyReadingDisplayOptions = create<VocabularyReadingDisplayState>()(
  persist(
    (set) => ({
      // Default display options for reading exercise
      displayHiragana: true,   // Show hiragana reading by default
      displayRomaji: false,    // Hide romaji by default  
      displayKanji: true,      // Show kanji by default

      toggleHiragana: () =>
        set((state) => ({ displayHiragana: !state.displayHiragana })),

      toggleRomaji: () =>
        set((state) => ({ displayRomaji: !state.displayRomaji })),

      toggleKanji: () =>
        set((state) => ({ displayKanji: !state.displayKanji })),

      resetToDefault: () =>
        set({
          displayHiragana: true,
          displayRomaji: false,
          displayKanji: true,
        }),
    }),
    {
      name: 'vocabulary-reading-display-options',
    }
  )
);