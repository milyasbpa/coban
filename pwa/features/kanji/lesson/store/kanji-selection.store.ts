import { create } from 'zustand';
import { KanjiDetail } from '@/pwa/core/services/kanji';

const STORAGE_KEY = 'kanji-selection-mode';

interface KanjiSelectionState {
  isSelectionMode: boolean;
  selectedKanjiIds: Set<number>;
  kanjiList: KanjiDetail[];
  toggleSelectionMode: () => void;
  setSelectionMode: (mode: boolean) => void;
  toggleKanjiSelection: (id: number) => void;
  clearSelection: () => void;
  selectAll: (ids: number[]) => void;
  setKanjiList: (list: KanjiDetail[]) => void;
  initializeSelectionMode: () => void;
}

// Helper functions for localStorage
const saveSelectionMode = (mode: boolean) => {
  if (typeof window !== 'undefined') {
    if (mode) {
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};

const loadSelectionMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }
  return false;
};

export const useKanjiSelection = create<KanjiSelectionState>((set, get) => ({
  isSelectionMode: false,
  selectedKanjiIds: new Set(),
  kanjiList: [],
  
  initializeSelectionMode: () => {
    const savedMode = loadSelectionMode();
    if (savedMode) {
      set({ isSelectionMode: true });
    }
  },
  
  toggleSelectionMode: () => {
    const currentMode = get().isSelectionMode;
    const newMode = !currentMode;
    saveSelectionMode(newMode);
    set({ 
      isSelectionMode: newMode,
      selectedKanjiIds: new Set() // Clear selection when toggling mode
    });
  },
  
  setSelectionMode: (mode: boolean) => {
    saveSelectionMode(mode);
    set({ 
      isSelectionMode: mode,
      selectedKanjiIds: mode ? get().selectedKanjiIds : new Set()
    });
  },
  
  toggleKanjiSelection: (id: number) => {
    const { selectedKanjiIds } = get();
    const newSelection = new Set(selectedKanjiIds);
    
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    
    set({ selectedKanjiIds: newSelection });
  },
  
  clearSelection: () => {
    set({ selectedKanjiIds: new Set() });
  },
  
  selectAll: (ids: number[]) => {
    set({ selectedKanjiIds: new Set(ids) });
  },
  
  setKanjiList: (list: KanjiDetail[]) => {
    set({ kanjiList: list });
  }
}));