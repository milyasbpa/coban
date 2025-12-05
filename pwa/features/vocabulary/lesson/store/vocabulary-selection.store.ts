import { create } from 'zustand';
import { VocabularyWord } from '@/pwa/core/services/vocabulary';

const STORAGE_KEY = 'vocabulary-selection-mode';

interface VocabularySelectionState {
  isSelectionMode: boolean;
  selectedVocabularyIds: Set<number>;
  vocabularyList: VocabularyWord[];
  toggleSelectionMode: () => void;
  setSelectionMode: (mode: boolean) => void;
  toggleVocabularySelection: (id: number) => void;
  clearSelection: () => void;
  selectAll: (ids: number[]) => void;
  setVocabularyList: (list: VocabularyWord[]) => void;
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

export const useVocabularySelection = create<VocabularySelectionState>((set, get) => ({
  isSelectionMode: false,
  selectedVocabularyIds: new Set(),
  vocabularyList: [],
  
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
      selectedVocabularyIds: new Set() // Clear selection when toggling mode
    });
  },
  
  setSelectionMode: (mode: boolean) => {
    saveSelectionMode(mode);
    set({ 
      isSelectionMode: mode,
      selectedVocabularyIds: mode ? get().selectedVocabularyIds : new Set()
    });
  },
  
  toggleVocabularySelection: (id: number) => {
    const { selectedVocabularyIds } = get();
    const newSelection = new Set(selectedVocabularyIds);
    
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    
    set({ selectedVocabularyIds: newSelection });
  },
  
  clearSelection: () => {
    set({ selectedVocabularyIds: new Set() });
  },
  
  selectAll: (ids: number[]) => {
    set({ selectedVocabularyIds: new Set(ids) });
  },
  
  setVocabularyList: (list: VocabularyWord[]) => {
    set({ vocabularyList: list });
  }
}));
