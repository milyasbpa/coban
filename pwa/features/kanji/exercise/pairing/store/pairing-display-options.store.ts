import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PairingDisplayOptionsState {
  displayFurigana: boolean;
  displayRomanji: boolean;
  displaySound: boolean;
  toggleFurigana: () => void;
  toggleRomanji: () => void;
  toggleSound: () => void;
  resetToDefault: () => void;
}

const defaultOptions = {
  displayFurigana: true,
  displayRomanji: true,
  displaySound: true,
};

export const usePairingDisplayOptions = create<PairingDisplayOptionsState>()(
  persist(
    (set, get) => ({
      displayFurigana: defaultOptions.displayFurigana,
      displayRomanji: defaultOptions.displayRomanji,
      displaySound: defaultOptions.displaySound,
      
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

      toggleSound: () => {
        set(state => ({
          displaySound: !state.displaySound
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
        displayRomanji: state.displayRomanji,
        displaySound: state.displaySound
      }),
    }
  )
);