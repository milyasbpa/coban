import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VocabularyDisplayOption {
  hiragana: boolean;
  japanese: boolean;
  meaning: boolean;
  romanji: boolean;
}

interface VocabularyDisplayOptionsState {
  displayOptions: VocabularyDisplayOption;
  toggleHiragana: () => void;
  toggleJapanese: () => void;
  toggleMeaning: () => void;
  toggleRomanji: () => void;
  resetToDefault: () => void;
}

const defaultOptions: VocabularyDisplayOption = {
  hiragana: true,
  japanese: true,
  meaning: true,
  romanji: true,
};

export const useVocabularyDisplayOptions = create<VocabularyDisplayOptionsState>()(
  persist(
    (set, get) => ({
      displayOptions: defaultOptions,
      
      toggleHiragana: () => {
        set(state => ({
          displayOptions: {
            ...state.displayOptions,
            hiragana: !state.displayOptions.hiragana
          }
        }));
      },
      
      toggleJapanese: () => {
        set(state => ({
          displayOptions: {
            ...state.displayOptions,
            japanese: !state.displayOptions.japanese
          }
        }));
      },
      
      toggleMeaning: () => {
        set(state => ({
          displayOptions: {
            ...state.displayOptions,
            meaning: !state.displayOptions.meaning
          }
        }));
      },
      
      toggleRomanji: () => {
        set(state => ({
          displayOptions: {
            ...state.displayOptions,
            romanji: !state.displayOptions.romanji
          }
        }));
      },
      
      resetToDefault: () => {
        set({ displayOptions: defaultOptions });
      }
    }),
    {
      name: 'vocabulary-display-options-storage',
      partialize: (state) => ({ displayOptions: state.displayOptions }),
    }
  )
);