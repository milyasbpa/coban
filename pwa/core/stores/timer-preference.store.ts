import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerPreferenceState {
  timerEnabled: boolean;
  timerValue: number; // in seconds
  
  // Actions
  setTimerEnabled: (enabled: boolean) => void;
  setTimerValue: (value: number) => void;
  resetToDefault: () => void;
}

const DEFAULT_TIMER_STATE = {
  timerEnabled: true,
  timerValue: 30,
};

export const useTimerPreferenceStore = create<TimerPreferenceState>()(
  persist(
    (set) => ({
      // Default values
      ...DEFAULT_TIMER_STATE,
      
      // Actions
      setTimerEnabled: (enabled) => set({ timerEnabled: enabled }),
      setTimerValue: (value) => set({ timerValue: value }),
      resetToDefault: () => set(DEFAULT_TIMER_STATE),
    }),
    {
      name: 'timer-preference-storage', // localStorage key
    }
  )
);
