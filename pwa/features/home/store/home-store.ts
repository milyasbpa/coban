import { create } from 'zustand';
import { VocabularyWord } from '@/pwa/core/services/vocabulary';

interface KanjiExerciseModal {
  isOpen: boolean;
  lessonId?: number | null;
  topicId?: string | null;
  lessonType: "stroke" | "topic";
  lessonName: string | null;
  kanjiList: string[];
}

interface VocabularyExerciseModal {
  categoryId: string;
  categoryName: string;
  vocabularyList: VocabularyWord[];
  level: string;
}

interface HomeState {
  kanjiExerciseModal: KanjiExerciseModal;
  vocabularyExerciseModal: VocabularyExerciseModal | null;
  openKanjiExerciseModal: (params: {
    lessonId?: number;
    topicId?: string;
    lessonType: "stroke" | "topic";
    lessonName: string;
    kanjiList: string[];
  }) => void;
  closeKanjiExerciseModal: () => void;
  openVocabularyExerciseModal: (params: VocabularyExerciseModal) => void;
  closeVocabularyExerciseModal: () => void;
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
  vocabularyExerciseModal: null,
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
  openVocabularyExerciseModal: (params) =>
    set(() => ({
      vocabularyExerciseModal: params,
    })),
  closeVocabularyExerciseModal: () =>
    set(() => ({
      vocabularyExerciseModal: null,
    })),
}));