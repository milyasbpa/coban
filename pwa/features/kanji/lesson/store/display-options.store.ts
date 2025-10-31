import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DisplayOption {
  furigana: boolean;
  japanese: boolean;
  meaning: boolean;
  romanji: boolean;
}

interface DisplayOptionsState {
  displayOptions: DisplayOption;
  toggleFurigana: () => void;
  toggleJapanese: () => void;
  toggleMeaning: () => void;
  toggleRomanji: () => void;
  resetToDefault: () => void;
}

const defaultOptions: DisplayOption = {
  furigana: true,
  japanese: true,
  meaning: true,
  romanji: true,
};

export const useDisplayOptions = create<DisplayOptionsState>()(
  persist(
    (set, get) => ({
      displayOptions: defaultOptions,
      
      toggleFurigana: () => {
        set(state => ({
          displayOptions: {
            ...state.displayOptions,
            furigana: !state.displayOptions.furigana
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
      name: 'display-options-storage',
      partialize: (state) => ({ displayOptions: state.displayOptions }),
    }
  )
);