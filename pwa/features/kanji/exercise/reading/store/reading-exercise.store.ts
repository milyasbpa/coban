import { create } from "zustand";
import { 
  ReadingQuestion,
  ReadingGameStats,
  AnswerResult
} from "../utils/reading-game";

interface GameState {
  questions: ReadingQuestion[];
  gameStats: ReadingGameStats;
  isGameComplete: boolean;
  isRetryMode: boolean;
  wrongQuestions: ReadingQuestion[];
  originalTotalQuestions: number;
  baseScore: number;
}

interface QuestionState {
  currentQuestionIndex: number;
  inputMode: "multiple-choice" | "direct-input";
  selectedOption: string;
  directInput: string;
  isAnswered: boolean;
  showBottomSheet: boolean;
  currentResult: AnswerResult | null;
}

interface ReadingExerciseState {
  // Semantic State Groups
  gameState: GameState;
  questionState: QuestionState;

  // Computed values
  getCurrentQuestion: () => ReadingQuestion | null;
  getProgress: () => number;
  getCanCheck: () => boolean;
  canRetry: () => boolean;
  getWrongQuestions: () => ReadingQuestion[];

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
  
  // Retry actions
  startRetryMode: () => void;
  addWrongQuestion: (question: ReadingQuestion) => void;
  
  // Handler for next question with score calculation
  handleNextQuestion: (calculateReadingScore: (stats: ReadingGameStats) => number) => void;
}

export const useReadingExerciseStore = create<ReadingExerciseState>((set, get) => ({
  // Semantic State Groups
  gameState: {
    questions: [],
    gameStats: {
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      currentQuestion: 1,
      score: 0
    },
    isGameComplete: false,
    isRetryMode: false,
    wrongQuestions: [],
    originalTotalQuestions: 0,
    baseScore: 0,
  },
  questionState: {
    currentQuestionIndex: 0,
    inputMode: "multiple-choice",
    selectedOption: "",
    directInput: "",
    isAnswered: false,
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
    const { questionState: { inputMode, selectedOption, directInput } } = get();
    return inputMode === "multiple-choice" 
      ? selectedOption.trim() !== "" 
      : directInput.trim() !== "";
  },

  canRetry: () => {
    const { gameState: { wrongQuestions } } = get();
    return wrongQuestions.length > 0;
  },

  getWrongQuestions: () => {
    const { gameState: { wrongQuestions } } = get();
    return wrongQuestions;
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
  
  setSelectedOption: (option) => 
    set((state) => ({
      questionState: { ...state.questionState, selectedOption: option }
    })),
  
  setDirectInput: (input) => 
    set((state) => ({
      questionState: { ...state.questionState, directInput: input }
    })),
  
  setIsAnswered: (answered) => 
    set((state) => ({
      questionState: { ...state.questionState, isAnswered: answered }
    })),
  
  setShowBottomSheet: (show) => 
    set((state) => ({
      questionState: { ...state.questionState, showBottomSheet: show }
    })),
  
  setCurrentResult: (result) => 
    set((state) => ({
      questionState: { ...state.questionState, currentResult: result }
    })),
  
  updateGameStats: (updates) => 
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStats: { ...state.gameState.gameStats, ...updates }
      }
    })),
  
  setIsGameComplete: (complete) => 
    set((state) => ({
      gameState: { ...state.gameState, isGameComplete: complete }
    })),

  // Game flow actions
  initializeGame: (questions, totalQuestions) => set({
    gameState: {
      questions,
      gameStats: {
        totalQuestions,
        correctAnswers: 0,
        wrongAnswers: 0,
        currentQuestion: 1,
        score: 0
      },
      isGameComplete: false,
      isRetryMode: false,
      wrongQuestions: [],
      originalTotalQuestions: 0,
      baseScore: 0,
    },
    questionState: {
      currentQuestionIndex: 0,
      inputMode: "multiple-choice",
      selectedOption: "",
      directInput: "",
      isAnswered: false,
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
        isAnswered: false,
        selectedOption: "",
        directInput: "",
      }
    }));

    if (currentQuestionIndex + 1 < questions.length) {
      // Move to next question
      set((state) => ({
        questionState: {
          ...state.questionState,
          currentQuestionIndex: state.questionState.currentQuestionIndex + 1,
        },
        gameState: {
          ...state.gameState,
          gameStats: {
            ...state.gameState.gameStats,
            currentQuestion: state.gameState.gameStats.currentQuestion + 1
          }
        }
      }));
    } else {
      // Game complete
      set((state) => ({
        gameState: { ...state.gameState, isGameComplete: true }
      }));
    }
  },

  resetAnswer: () => 
    set((state) => ({
      questionState: {
        ...state.questionState,
        selectedOption: "",
        directInput: "",
        isAnswered: false,
        showBottomSheet: false,
        currentResult: null
      }
    })),

  restartGame: () => {
    const { gameState: { questions } } = get();
    set({
      gameState: {
        questions,
        gameStats: {
          totalQuestions: questions.length,
          correctAnswers: 0,
          wrongAnswers: 0,
          currentQuestion: 1,
          score: 0
        },
        isGameComplete: false,
        isRetryMode: false,
        wrongQuestions: [],
        originalTotalQuestions: 0,
        baseScore: 0,
      },
      questionState: {
        currentQuestionIndex: 0,
        inputMode: "multiple-choice",
        selectedOption: "",
        directInput: "",
        isAnswered: false,
        showBottomSheet: false,
        currentResult: null,
      }
    });
  },

  // Retry system implementation
  startRetryMode: () => {
    const { gameState: { wrongQuestions, gameStats } } = get();
    if (wrongQuestions.length === 0) return;
    
    set({
      gameState: {
        questions: [...wrongQuestions], // Set questions to wrong questions only
        gameStats: {
          totalQuestions: wrongQuestions.length,
          correctAnswers: 0,
          wrongAnswers: 0,
          currentQuestion: 1,
          score: gameStats.score // Start from previous score
        },
        isGameComplete: false,
        isRetryMode: true,
        wrongQuestions: wrongQuestions,
        baseScore: gameStats.score, // Store current score as base
        originalTotalQuestions: gameStats.totalQuestions, // Store original total
      },
      questionState: {
        currentQuestionIndex: 0,
        inputMode: "multiple-choice",
        selectedOption: "",
        directInput: "",
        isAnswered: false,
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

  handleNextQuestion: (calculateReadingScore) => {
    const { 
      gameState: { gameStats, isRetryMode, baseScore, originalTotalQuestions }, 
      nextQuestion: next, 
      updateGameStats 
    } = get();
    
    // Calculate final score before moving to next question if this is the last question
    const isLastQuestion = gameStats.currentQuestion === gameStats.totalQuestions;
    
    if (isLastQuestion) {
      let finalScore;
      
      if (isRetryMode) {
        // Retry mode scoring: baseScore + (correct answers * points per original question)
        const pointsPerOriginalQuestion = 100 / originalTotalQuestions;
        const bonusPoints = gameStats.correctAnswers * pointsPerOriginalQuestion;
        finalScore = Math.min(100, baseScore + bonusPoints);
      } else {
        // Normal mode scoring  
        finalScore = calculateReadingScore(gameStats);
      }
      
      updateGameStats({ score: Math.round(finalScore) });
    }
    
    next();
  },
}));