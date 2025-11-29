import { create } from 'zustand';
import { VocabularyWord } from '@/pwa/core/services/vocabulary';
import { GrammarPattern } from '@/types/grammar';

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

interface GrammarExerciseModal {
  patternId: string;
  patternName: string;
  pattern: GrammarPattern;
  level: string;
}

interface HomeState {
  kanjiExerciseModal: KanjiExerciseModal;
  vocabularyExerciseModal: VocabularyExerciseModal | null;
  grammarExerciseModal: GrammarExerciseModal | null;
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
  openGrammarExerciseModal: (params: GrammarExerciseModal) => void;
  closeGrammarExerciseModal: () => void;
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
  grammarExerciseModal: null,
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
  openGrammarExerciseModal: (params) =>
    set(() => ({
      grammarExerciseModal: params,
    })),
  closeGrammarExerciseModal: () =>
    set(() => ({
      grammarExerciseModal: null,
    })),
}));