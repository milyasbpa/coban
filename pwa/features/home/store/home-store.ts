import { create } from 'zustand';

interface KanjiExerciseModal {
  isOpen: boolean;
  lessonId?: number | null;
  topicId?: string | null;
  lessonType: "stroke" | "topic";
  lessonName: string | null;
  kanjiList: string[];
}

interface HomeState {
  kanjiExerciseModal: KanjiExerciseModal;
  openKanjiExerciseModal: (params: {
    lessonId?: number;
    topicId?: string;
    lessonType: "stroke" | "topic";
    lessonName: string;
    kanjiList: string[];
  }) => void;
  closeKanjiExerciseModal: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  kanjiExerciseModal: {
    isOpen: false,
    lessonId: null,
    topicId: null,
    lessonType: "stroke",
    lessonName: null,
    kanjiList: [],
  },
  openKanjiExerciseModal: (params) =>
    set((state) => ({
      kanjiExerciseModal: {
        ...state.kanjiExerciseModal,
        isOpen: true,
        lessonId: params.lessonId || null,
        topicId: params.topicId || null,
        lessonType: params.lessonType,
        lessonName: params.lessonName,
        kanjiList: params.kanjiList,
      },
    })),
  closeKanjiExerciseModal: () =>
    set((state) => ({
      kanjiExerciseModal: {
        ...state.kanjiExerciseModal,
        isOpen: false,
        lessonId: null,
        topicId: null,
        lessonType: "stroke",
        lessonName: null,
        kanjiList: [],
      },
    })),
}));