import { create } from "zustand";
import { 
  ReadingQuestion,
  AnswerResult,
  isAnswerCorrect
} from "../utils/reading-game";
import { KanjiExample } from "@/pwa/core/services/kanji";
import { integrateReadingGameScore } from "../utils/scoring-integration";

export interface GameState {
  questions: ReadingQuestion[];
  correctQuestions: ReadingQuestion[];
  isComplete: boolean;
  isRetryMode: boolean;
  wrongQuestions: ReadingQuestion[];
  score: number;
}

export interface QuestionState {
  currentQuestionIndex: number;
  inputMode: "multiple-choice" | "direct-input";
  selectedOption: KanjiExample | null;  // Changed to KanjiExample
  directInput: string;
  showBottomSheet: boolean;
  currentResult: AnswerResult | null;
}

export interface ReadingExerciseState {
  // Semantic State Groups
  gameState: GameState;
  questionState: QuestionState;

  // Computed values
  getCurrentQuestion: () => ReadingQuestion | null;
  getProgress: () => number;
  getCanCheck: () => boolean;
  canRetry: () => boolean;
  getWrongQuestions: () => ReadingQuestion[];
  getTotalQuestions: () => number;
  getCurrentQuestionNumber: () => number;
  getWrongAnswers: () => number;
  getCorrectAnswers: () => number;
  getIsAnswered: () => boolean;
  getIsCurrentAnswerCorrect: () => boolean;  // New computed function
  getSelectedAnswerText: () => string;       // Helper for display

  // Actions
  setQuestions: (questions: ReadingQuestion[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setInputMode: (mode: "multiple-choice" | "direct-input") => void;
  setSelectedOption: (option: KanjiExample | null) => void;  // Updated type
  setDirectInput: (input: string) => void;
  setShowBottomSheet: (show: boolean) => void;
  setCurrentResult: (result: AnswerResult | null) => void;
  setIsComplete: (complete: boolean) => void;
  
  // Game flow actions
  initializeGame: (questions: ReadingQuestion[]) => void;
  nextQuestion: () => void;
  resetAnswer: () => void;
  restartGame: () => void;
  
  // Retry actions
  startRetryMode: () => void;
  addWrongQuestion: (question: ReadingQuestion) => void;
  addCorrectQuestion: (question: ReadingQuestion) => void;
  
  // Handler for next question with score calculation
  handleNextQuestion: (
    calculateReadingScore: (correctQuestions: ReadingQuestion[], totalQuestions: number) => number,
    level: string,
    updateKanjiMastery: (kanjiId: string, character: string, results: any[]) => Promise<void>,
    initializeUser: (userId: string, level: "N5" | "N4" | "N3" | "N2" | "N1") => Promise<void>,
    isInitialized: boolean,
    currentUserScore: any,
    userId: string | null
  ) => void;
}

export const useReadingExerciseStore = create<ReadingExerciseState>((set, get) => ({
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
    inputMode: "multiple-choice",
    selectedOption: null,
    directInput: "",
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
      ? selectedOption !== null
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
    const { questionState: { selectedOption }, getCurrentQuestion } = get();
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !selectedOption) return false;
    return isAnswerCorrect(currentQuestion, selectedOption);
  },

  getSelectedAnswerText: () => {
    const { questionState: { selectedOption, directInput, inputMode } } = get();
    if (inputMode === "direct-input") return directInput;
    return selectedOption ? selectedOption.furigana : "";
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
      inputMode: "multiple-choice",
      selectedOption: null,
      directInput: "",
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
        selectedOption: null,
        directInput: "",
      }
    }));

    if (currentQuestionIndex + 1 < questions.length) {
      // Move to next question
      set((state) => ({
        questionState: {
          ...state.questionState,
          currentQuestionIndex: state.questionState.currentQuestionIndex + 1,
        }
      }));
    } else {
      // Game complete
      set((state) => ({
        gameState: { ...state.gameState, isComplete: true }
      }));
    }
  },

  resetAnswer: () => 
    set((state) => ({
      questionState: {
        ...state.questionState,
        selectedOption: null,
        directInput: "",
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
        inputMode: "multiple-choice",
        selectedOption: null,
        directInput: "",
        showBottomSheet: false,
        currentResult: null,
      }
    });
  },

  // Retry system implementation
  startRetryMode: () => {
    const { gameState: { wrongQuestions, score, questions } } = get();
    if (wrongQuestions.length === 0) return;
    
    set({
      gameState: {
        questions: [...questions], // Keep all original questions
        correctQuestions: [],
        isComplete: false,
        isRetryMode: true,
        wrongQuestions: wrongQuestions,
        score: score, // Keep current score
      },
      questionState: {
        currentQuestionIndex: 0,
        inputMode: "multiple-choice",
        selectedOption: null,
        directInput: "",
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

  handleNextQuestion: (calculateReadingScore, level, updateKanjiMastery, initializeUser, isInitialized, currentUserScore, userId) => {
    const { 
      gameState: { correctQuestions, isRetryMode, score, questions, wrongQuestions }, 
      getTotalQuestions,
      getCurrentQuestionNumber,
      nextQuestion: next 
    } = get();
    
    // Calculate final score before moving to next question if this is the last question
    const totalQuestions = getTotalQuestions();
    const currentQuestionNumber = getCurrentQuestionNumber();
    const isLastQuestion = currentQuestionNumber === totalQuestions;
    
    if (isLastQuestion) {
      let finalScore;
      
      if (isRetryMode) {
        // Retry mode scoring: current score + (correct answers * points per original question)
        const pointsPerOriginalQuestion = 100 / questions.length;
        const bonusPoints = correctQuestions.length * pointsPerOriginalQuestion;
        finalScore = Math.min(100, score + bonusPoints);
      } else {
        // Normal mode scoring  
        finalScore = calculateReadingScore(correctQuestions, totalQuestions);
      }
      
      // Update score directly to gameState
      set((state) => ({
        gameState: {
          ...state.gameState,
          score: Math.round(finalScore)
        }
      }));

      // Integrate kanji scoring at game completion
      (async () => {
        try {
          // Only save if userId is provided (authenticated user)
          if (userId) {
            await integrateReadingGameScore(
              questions,
              wrongQuestions,
              level,
              userId,
              updateKanjiMastery,
              initializeUser,
              isInitialized,
              currentUserScore
            );
          } else {
            console.log("⚠️ Guest user - score not saved");
          }
        } catch (error) {
          console.error("Error integrating reading game score:", error);
        }
      })();
    }
    
    next();
  },
}));