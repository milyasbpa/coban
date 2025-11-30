import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VocabularyPairingDisplayState {
  // Display options for vocabulary pairing
  displayHiragana: boolean;
  displayRomaji: boolean;
  displayKanji: boolean;
  displaySound: boolean;

  // Actions
  toggleHiragana: () => void;
  toggleRomaji: () => void;
  toggleKanji: () => void;
  toggleSound: () => void;
  resetToDefault: () => void;
}

export const useVocabularyPairingDisplayOptions = create<VocabularyPairingDisplayState>()(
  persist(
    (set) => ({
      // Default display options
      displayHiragana: true,   // Show hiragana by default (like furigana for kanji)
      displayRomaji: false,    // Hide romaji by default
      displayKanji: true,      // Show kanji by default
      displaySound: true,      // Sound enabled by default

      toggleHiragana: () =>
        set((state) => ({ displayHiragana: !state.displayHiragana })),

      toggleRomaji: () =>
        set((state) => ({ displayRomaji: !state.displayRomaji })),

      toggleKanji: () =>
        set((state) => ({ displayKanji: !state.displayKanji })),

      toggleSound: () =>
        set((state) => ({ displaySound: !state.displaySound })),

      resetToDefault: () =>
        set({
          displayHiragana: true,
          displayRomaji: false,
          displayKanji: true,
          displaySound: true,
        }),
    }),
    {
      name: 'vocabulary-pairing-display-options',
    }
  )
);