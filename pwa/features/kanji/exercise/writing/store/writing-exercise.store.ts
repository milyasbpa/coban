import { create } from 'zustand';

interface WritingExerciseState {
  currentQuestionIndex: number;
  selectedKanji: string[];
  correctAnswer: string;
  availableKanji: string[];
  score: number;
  isComplete: boolean;
  showAnswer: boolean;
  setCurrentQuestionIndex: (index: number) => void;
  addKanji: (kanji: string) => void;
  removeKanji: (index: number) => void;
  clearSelected: () => void;
  setCorrectAnswer: (answer: string) => void;
  setAvailableKanji: (kanji: string[]) => void;
  checkAnswer: () => boolean;
  nextQuestion: () => void;
  resetExercise: () => void;
  setShowAnswer: (show: boolean) => void;
}

export const useWritingExerciseStore = create<WritingExerciseState>((set, get) => ({
  currentQuestionIndex: 0,
  selectedKanji: [],
  correctAnswer: '',
  availableKanji: [],
  score: 0,
  isComplete: false,
  showAnswer: false,

  setCurrentQuestionIndex: (index: number) => set({ currentQuestionIndex: index }),

  addKanji: (kanji: string) => {
    const { selectedKanji, availableKanji } = get();
    if (availableKanji.includes(kanji)) {
      set({ selectedKanji: [...selectedKanji, kanji] });
    }
  },

  removeKanji: (index: number) => {
    const { selectedKanji } = get();
    const newSelected = selectedKanji.filter((_, i) => i !== index);
    set({ selectedKanji: newSelected });
  },

  clearSelected: () => set({ selectedKanji: [] }),

  setCorrectAnswer: (answer: string) => set({ correctAnswer: answer }),

  setAvailableKanji: (kanji: string[]) => set({ availableKanji: kanji }),

  checkAnswer: () => {
    const { selectedKanji, correctAnswer } = get();
    const userAnswer = selectedKanji.join('');
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
      set(state => ({ score: state.score + 1 }));
    }
    
    set({ showAnswer: true });
    return isCorrect;
  },

  nextQuestion: () => {
    set(state => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
      selectedKanji: [],
      showAnswer: false
    }));
  },

  resetExercise: () => set({
    currentQuestionIndex: 0,
    selectedKanji: [],
    correctAnswer: '',
    availableKanji: [],
    score: 0,
    isComplete: false,
    showAnswer: false
  }),

  setShowAnswer: (show: boolean) => set({ showAnswer: show })
}));