import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReadingDisplayOptionsState {
  displayRomanji: boolean;
  toggleRomanji: () => void;
  resetToDefault: () => void;
}

const defaultOptions = {
  displayRomanji: true,
};

export const useReadingDisplayOptions = create<ReadingDisplayOptionsState>()(
  persist(
    (set, get) => ({
      displayRomanji: defaultOptions.displayRomanji,
      
      toggleRomanji: () => {
        set(state => ({
          displayRomanji: !state.displayRomanji
        }));
      },

      resetToDefault: () => {
        set(defaultOptions);
      },
    }),
    {
      name: 'reading-display-options-storage', // Different storage name from pairing
      partialize: (state) => ({ 
        displayRomanji: state.displayRomanji
      }),
    }
  )
);