import { create } from "zustand";
import { 
  ReadingQuestion,
  ReadingGameStats,
  AnswerResult
} from "../utils/reading-game";

interface ReadingExerciseState {
  // Game state
  questions: ReadingQuestion[];
  currentQuestionIndex: number;
  inputMode: "multiple-choice" | "direct-input";
  selectedOption: string;
  directInput: string;
  isAnswered: boolean;
  showBottomSheet: boolean;
  currentResult: AnswerResult | null;
  gameStats: ReadingGameStats;
  isGameComplete: boolean;

  // Computed values
  getCurrentQuestion: () => ReadingQuestion | null;
  getProgress: () => number;
  getCanCheck: () => boolean;

  // Actions
  setQuestions: (questions: ReadingQuestion[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setInputMode: (mode: "multiple-choice" | "direct-input") => void;
  setSelectedOption: (option: string) => void;
  setDirectInput: (input: string) => void;
  setIsAnswered: (answered: boolean) => void;
  setShowBottomSheet: (show: boolean) => void;
  setCurrentResult: (result: AnswerResult | null) => void;
  updateGameStats: (stats: Partial<ReadingGameStats>) => void;
  setIsGameComplete: (complete: boolean) => void;
  
  // Game flow actions
  initializeGame: (questions: ReadingQuestion[], totalQuestions: number) => void;
  nextQuestion: () => void;
  resetAnswer: () => void;
  restartGame: () => void;
  
  // Handler for next question with score calculation
  handleNextQuestion: (calculateReadingScore: (stats: ReadingGameStats) => number) => void;
}

export const useReadingExerciseStore = create<ReadingExerciseState>((set, get) => ({
  // Initial state
  questions: [],
  currentQuestionIndex: 0,
  inputMode: "multiple-choice",
  selectedOption: "",
  directInput: "",
  isAnswered: false,
  showBottomSheet: false,
  currentResult: null,
  gameStats: {
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentQuestion: 1,
    score: 0
  },
  isGameComplete: false,

  // Computed values
  getCurrentQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    return questions[currentQuestionIndex] || null;
  },

  getProgress: () => {
    const { questions, currentQuestionIndex } = get();
    return questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;
  },

  getCanCheck: () => {
    const { inputMode, selectedOption, directInput } = get();
    return inputMode === "multiple-choice" 
      ? selectedOption.trim() !== "" 
      : directInput.trim() !== "";
  },

  // Actions
  setQuestions: (questions) => set({ questions }),
  
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  
  setInputMode: (mode) => set({ inputMode: mode }),
  
  setSelectedOption: (option) => set({ selectedOption: option }),
  
  setDirectInput: (input) => set({ directInput: input }),
  
  setIsAnswered: (answered) => set({ isAnswered: answered }),
  
  setShowBottomSheet: (show) => set({ showBottomSheet: show }),
  
  setCurrentResult: (result) => set({ currentResult: result }),
  
  updateGameStats: (updates) => set((state) => ({
    gameStats: { ...state.gameStats, ...updates }
  })),
  
  setIsGameComplete: (complete) => set({ isGameComplete: complete }),

  // Game flow actions
  initializeGame: (questions, totalQuestions) => set({
    questions,
    currentQuestionIndex: 0,
    inputMode: "multiple-choice",
    selectedOption: "",
    directInput: "",
    isAnswered: false,
    showBottomSheet: false,
    currentResult: null,
    isGameComplete: false,
    gameStats: {
      totalQuestions,
      correctAnswers: 0,
      wrongAnswers: 0,
      currentQuestion: 1,
      score: 0
    }
  }),

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    
    set({
      showBottomSheet: false,
      currentResult: null,
      isAnswered: false,
      selectedOption: "",
      directInput: "",
    });

    if (currentQuestionIndex + 1 < questions.length) {
      // Move to next question
      set((state) => ({
        currentQuestionIndex: state.currentQuestionIndex + 1,
        gameStats: {
          ...state.gameStats,
          currentQuestion: state.gameStats.currentQuestion + 1
        }
      }));
    } else {
      // Game complete
      set({ isGameComplete: true });
    }
  },

  resetAnswer: () => set({
    selectedOption: "",
    directInput: "",
    isAnswered: false,
    showBottomSheet: false,
    currentResult: null
  }),

  restartGame: () => {
    const { questions } = get();
    set({
      currentQuestionIndex: 0,
      inputMode: "multiple-choice",
      selectedOption: "",
      directInput: "",
      isAnswered: false,
      showBottomSheet: false,
      currentResult: null,
      isGameComplete: false,
      gameStats: {
        totalQuestions: questions.length,
        correctAnswers: 0,
        wrongAnswers: 0,
        currentQuestion: 1,
        score: 0
      }
    });
  },

  handleNextQuestion: (calculateReadingScore) => {
    const { gameStats, nextQuestion: next, updateGameStats } = get();
    
    // Calculate final score before moving to next question if this is the last question
    const isLastQuestion = gameStats.currentQuestion === gameStats.totalQuestions;
    
    if (isLastQuestion) {
      const finalScore = calculateReadingScore(gameStats);
      updateGameStats({ score: finalScore });
    }
    
    next();
  },
}));