import { create } from 'zustand';
import { VocabularyWord } from '@/pwa/core/services/vocabulary';

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
}

export const useVocabularySelection = create<VocabularySelectionState>((set, get) => ({
  isSelectionMode: false,
  selectedVocabularyIds: new Set(),
  vocabularyList: [],
  
  toggleSelectionMode: () => {
    const currentMode = get().isSelectionMode;
    set({ 
      isSelectionMode: !currentMode,
      selectedVocabularyIds: new Set() // Clear selection when toggling mode
    });
  },
  
  setSelectionMode: (mode: boolean) => {
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
