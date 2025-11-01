import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PairingDisplayOptionsState {
  displayFurigana: boolean;
  displayRomanji: boolean;
  toggleFurigana: () => void;
  toggleRomanji: () => void;
  resetToDefault: () => void;
}

const defaultOptions = {
  displayFurigana: true,
  displayRomanji: true,
};

export const usePairingDisplayOptions = create<PairingDisplayOptionsState>()(
  persist(
    (set, get) => ({
      displayFurigana: defaultOptions.displayFurigana,
      displayRomanji: defaultOptions.displayRomanji,
      
      toggleFurigana: () => {
        set(state => ({
          displayFurigana: !state.displayFurigana
        }));
      },

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
      name: 'pairing-display-options-storage',
      partialize: (state) => ({ 
        displayFurigana: state.displayFurigana,
        displayRomanji: state.displayRomanji
      }),
    }
  )
);