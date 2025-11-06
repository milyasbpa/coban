import { create } from "zustand";
import { VocabularyQuestion, VocabularyExerciseWord } from "../../shared/types";

export interface VocabularyWritingGameState {
  questions: VocabularyQuestion[];
  correctQuestions: VocabularyQuestion[];
  isComplete: boolean;
  isRetryMode: boolean;
  wrongQuestions: VocabularyQuestion[];
  score: number;
}

export interface VocabularyWritingQuestionState {
  currentQuestionIndex: number;
  inputMode: "romaji" | "hiragana" | "kanji";
  userInput: string;
  showBottomSheet: boolean;
  currentResult: any | null;
}

export interface VocabularyWritingExerciseState {
  // Semantic State Groups
  gameState: VocabularyWritingGameState;
  questionState: VocabularyWritingQuestionState;

  // Computed values
  getCurrentQuestion: () => VocabularyQuestion | null;
  getProgress: () => number;
  getCanCheck: () => boolean;
  canRetry: () => boolean;
  getWrongQuestions: () => VocabularyQuestion[];
  getTotalQuestions: () => number;
  getCurrentQuestionNumber: () => number;
  getWrongAnswers: () => number;
  getCorrectAnswers: () => number;
  getIsAnswered: () => boolean;
  getIsCurrentAnswerCorrect: () => boolean;
  getUserInput: () => string;

  // Actions
  setQuestions: (questions: VocabularyQuestion[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setInputMode: (mode: "romaji" | "hiragana" | "kanji") => void;
  setUserInput: (input: string) => void;
  setShowBottomSheet: (show: boolean) => void;
  setCurrentResult: (result: any | null) => void;
  setIsComplete: (complete: boolean) => void;
  
  // Game flow actions
  initializeGame: (questions: VocabularyQuestion[]) => void;
  nextQuestion: () => void;
  resetAnswer: () => void;
  restartGame: () => void;
  
  // Retry actions
  startRetryMode: () => void;
  addWrongQuestion: (question: VocabularyQuestion) => void;
  addCorrectQuestion: (question: VocabularyQuestion) => void;
  
  // Handler for next question with score calculation
  handleNextQuestion: (calculateScore: (correctQuestions: VocabularyQuestion[], totalQuestions: number) => number) => void;
}

export const useVocabularyWritingExerciseStore = create<VocabularyWritingExerciseState>((set, get) => ({
  // Semantic State Groups
  gameState: {
    questions: [],
    correctQuestions: [],
    isComplete: false,
    isRetryMode: false,
    wrongQuestions: [],
    score: 0,
  },
  questionState: {
    currentQuestionIndex: 0,
    inputMode: "romaji",
    userInput: "",
    showBottomSheet: false,
    currentResult: null,
  },

  // Computed values
  getCurrentQuestion: () => {
    const { gameState: { questions }, questionState: { currentQuestionIndex } } = get();
    return questions[currentQuestionIndex] || null;
  },

  getProgress: () => {
    const { gameState: { questions }, questionState: { currentQuestionIndex } } = get();
    return questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;
  },

  getCanCheck: () => {
    const { questionState: { userInput } } = get();
    return userInput.trim() !== "";
  },

  canRetry: () => {
    const { gameState: { wrongQuestions } } = get();
    return wrongQuestions.length > 0;
  },

  getWrongQuestions: () => {
    const { gameState: { wrongQuestions } } = get();
    return wrongQuestions;
  },

  getTotalQuestions: () => {
    const { gameState: { questions, isRetryMode, wrongQuestions } } = get();
    return isRetryMode ? wrongQuestions.length : questions.length;
  },

  getCurrentQuestionNumber: () => {
    const { questionState: { currentQuestionIndex } } = get();
    return currentQuestionIndex + 1;
  },

  getWrongAnswers: () => {
    const { gameState: { wrongQuestions } } = get();
    return wrongQuestions.length;
  },

  getCorrectAnswers: () => {
    const { gameState: { correctQuestions } } = get();
    return correctQuestions.length;
  },

  getIsAnswered: () => {
    const { questionState: { currentResult } } = get();
    return currentResult !== null;
  },

  getIsCurrentAnswerCorrect: () => {
    const { questionState: { currentResult } } = get();
    return currentResult?.isCorrect || false;
  },

  getUserInput: () => {
    const { questionState: { userInput } } = get();
    return userInput;
  },

  // Actions
  setQuestions: (questions) => 
    set((state) => ({
      gameState: { ...state.gameState, questions }
    })),
  
  setCurrentQuestionIndex: (index) => 
    set((state) => ({
      questionState: { ...state.questionState, currentQuestionIndex: index }
    })),
  
  setInputMode: (mode) => 
    set((state) => ({
      questionState: { ...state.questionState, inputMode: mode }
    })),
  
  setUserInput: (input) => 
    set((state) => ({
      questionState: { ...state.questionState, userInput: input }
    })),
  
  setShowBottomSheet: (show) => 
    set((state) => ({
      questionState: { ...state.questionState, showBottomSheet: show }
    })),
  
  setCurrentResult: (result) => 
    set((state) => ({
      questionState: { ...state.questionState, currentResult: result }
    })),
  
  setIsComplete: (complete) => 
    set((state) => ({
      gameState: { ...state.gameState, isComplete: complete }
    })),

  // Game flow actions
  initializeGame: (questions) => set({
    gameState: {
      questions,
      correctQuestions: [],
      isComplete: false,
      isRetryMode: false,
      wrongQuestions: [],
      score: 0,
    },
    questionState: {
      currentQuestionIndex: 0,
      inputMode: "romaji",
      userInput: "",
      showBottomSheet: false,
      currentResult: null,
    }
  }),

  nextQuestion: () => {
    const { gameState: { questions }, questionState: { currentQuestionIndex } } = get();
    
    set((state) => ({
      questionState: {
        ...state.questionState,
        showBottomSheet: false,
        currentResult: null,
        userInput: "",
      }
    }));

    if (currentQuestionIndex + 1 < questions.length) {
      set((state) => ({
        questionState: {
          ...state.questionState,
          currentQuestionIndex: state.questionState.currentQuestionIndex + 1,
        }
      }));
    } else {
      set((state) => ({
        gameState: { ...state.gameState, isComplete: true }
      }));
    }
  },

  resetAnswer: () => 
    set((state) => ({
      questionState: {
        ...state.questionState,
        userInput: "",
        showBottomSheet: false,
        currentResult: null
      }
    })),

  restartGame: () => {
    const { gameState: { questions } } = get();
    set({
      gameState: {
        questions,
        correctQuestions: [],
        isComplete: false,
        isRetryMode: false,
        wrongQuestions: [],
        score: 0,
      },
      questionState: {
        currentQuestionIndex: 0,
        inputMode: "romaji",
        userInput: "",
        showBottomSheet: false,
        currentResult: null,
      }
    });
  },

  startRetryMode: () => {
    const { gameState: { wrongQuestions, score, questions } } = get();
    if (wrongQuestions.length === 0) return;
    
    set({
      gameState: {
        questions: [...questions],
        correctQuestions: [],
        isComplete: false,
        isRetryMode: true,
        wrongQuestions: wrongQuestions,
        score: score,
      },
      questionState: {
        currentQuestionIndex: 0,
        inputMode: "romaji",
        userInput: "",
        showBottomSheet: false,
        currentResult: null,
      }
    });
  },

  addWrongQuestion: (question) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        wrongQuestions: [...state.gameState.wrongQuestions, question]
      }
    }));
  },

  addCorrectQuestion: (question) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        correctQuestions: [...state.gameState.correctQuestions, question]
      }
    }));
  },

  handleNextQuestion: (calculateScore) => {
    const { 
      gameState: { correctQuestions, isRetryMode, score, questions }, 
      getTotalQuestions,
      getCurrentQuestionNumber,
      nextQuestion: next 
    } = get();
    
    const totalQuestions = getTotalQuestions();
    const currentQuestionNumber = getCurrentQuestionNumber();
    const isLastQuestion = currentQuestionNumber === totalQuestions;
    
    if (isLastQuestion) {
      let finalScore;
      
      if (isRetryMode) {
        const pointsPerOriginalQuestion = 100 / questions.length;
        const bonusPoints = correctQuestions.length * pointsPerOriginalQuestion;
        finalScore = Math.min(100, score + bonusPoints);
      } else {
        finalScore = calculateScore(correctQuestions, totalQuestions);
      }
      
      set((state) => ({
        gameState: {
          ...state.gameState,
          score: Math.round(finalScore)
        }
      }));
    }
    
    next();
  },
}));