import { create } from 'zustand';

interface KanjiSelectionState {
  isSelectionMode: boolean;
  selectedKanjiIds: Set<number>;
  toggleSelectionMode: () => void;
  setSelectionMode: (mode: boolean) => void;
  toggleKanjiSelection: (id: number) => void;
  clearSelection: () => void;
  selectAll: (ids: number[]) => void;
}

export const useKanjiSelection = create<KanjiSelectionState>((set, get) => ({
  isSelectionMode: false,
  selectedKanjiIds: new Set(),
  
  toggleSelectionMode: () => {
    const currentMode = get().isSelectionMode;
    set({ 
      isSelectionMode: !currentMode,
      selectedKanjiIds: new Set() // Clear selection when toggling mode
    });
  },
  
  setSelectionMode: (mode: boolean) => {
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
  }
}));