import { create } from 'zustand';

interface ExerciseModal {
  isOpen: boolean;
  lessonId: number | null;
  lessonNumber: number | null;
  kanjiList: string[];
}

interface HomeState {
  exerciseModal: ExerciseModal;
  openExerciseModal: (lessonId: number, lessonNumber: number, kanjiList: string[]) => void;
  closeExerciseModal: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  exerciseModal: {
    isOpen: false,
    lessonId: null,
    lessonNumber: null,
    kanjiList: [],
  },
  openExerciseModal: (lessonId, lessonNumber, kanjiList) =>
    set((state) => ({
      exerciseModal: {
        ...state.exerciseModal,
        isOpen: true,
        lessonId,
        lessonNumber,
        kanjiList,
      },
    })),
  closeExerciseModal: () =>
    set((state) => ({
      exerciseModal: {
        ...state.exerciseModal,
        isOpen: false,
        lessonId: null,
        lessonNumber: null,
        kanjiList: [],
      },
    })),
}));