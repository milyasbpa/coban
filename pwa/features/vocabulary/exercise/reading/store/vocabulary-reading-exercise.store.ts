import { create } from "zustand";
import { VocabularyQuestion, VocabularyExerciseWord } from "../../shared/types";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { generateReadingQuestions, calculateScore, checkAnswer } from "../utils/vocabulary-reading.utils";
import { integrateVocabularyReadingGameScore } from "../utils/scoring-integration";

export interface VocabularyGameState {
  questions: VocabularyQuestion[];
  correctQuestions: VocabularyQuestion[];
  isComplete: boolean;
  isRetryMode: boolean;
  wrongQuestions: VocabularyQuestion[];
  score: number;
}

export interface VocabularyQuestionState {
  currentQuestionIndex: number;
  inputMode: "multiple-choice" | "direct-input";
  selectedOption: string | null;
  directInput: string;
  showBottomSheet: boolean;
  currentResult: any | null;
}

export interface VocabularyReadingExerciseState {
  // Semantic State Groups
  gameState: VocabularyGameState;
  questionState: VocabularyQuestionState;

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
  getSelectedAnswerText: () => string;

  // Actions
  setQuestions: (questions: VocabularyQuestion[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setInputMode: (mode: "multiple-choice" | "direct-input") => void;
  setSelectedOption: (option: string | null) => void;
  setDirectInput: (input: string) => void;
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
  
  // Handler for next question with score calculation and integration
  handleNextQuestion: (
    calculateScore: (correctQuestions: VocabularyQuestion[], totalQuestions: number) => number,
    level: string,
    categoryId: string
  ) => void;

  // Initialize exercise function
  initializeExercise: (level: string, categoryId: string, selectedVocabularyIds?: number[]) => Promise<void>;
  
  // Check answer function 
  handleCheckAnswer: () => void;
}

export const useVocabularyReadingExerciseStore = create<VocabularyReadingExerciseState>((set, get) => ({
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
    return selectedOption === currentQuestion.correctAnswer;
  },

  getSelectedAnswerText: () => {
    const { questionState: { selectedOption, directInput, inputMode } } = get();
    if (inputMode === "direct-input") return directInput;
    return selectedOption || "";
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

  handleNextQuestion: (calculateScore, level, categoryId) => {
    const { 
      gameState: { correctQuestions, isRetryMode, score, questions, wrongQuestions }, 
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

      // Integrate vocabulary scoring at game completion (only for non-retry mode)
      if (!isRetryMode) {
        (async () => {
          try {
            await integrateVocabularyReadingGameScore(
              questions,
              wrongQuestions,
              level,
              categoryId
            );
          } catch (error) {
            console.error("Error integrating vocabulary reading game score:", error);
          }
        })();
      }
    }
    
    next();
  },

  // Initialize exercise function
  initializeExercise: async (level: string, categoryId: string, selectedVocabularyIds?: number[]) => {
    try {
      // Get vocabulary category
      const vocabularyCategory = VocabularyService.getVocabularyByCategoryString(categoryId, level);
      
      if (!vocabularyCategory || vocabularyCategory.vocabulary.length === 0) {
        console.error("No vocabulary words found for exercise");
        return;
      }

      // Filter vocabulary if selectedVocabularyIds provided (from selection mode)
      let vocabularyWords = vocabularyCategory.vocabulary;
      if (selectedVocabularyIds && selectedVocabularyIds.length > 0) {
        vocabularyWords = vocabularyWords.filter((word) =>
          selectedVocabularyIds.includes(word.id)
        );
      }

      if (vocabularyWords.length === 0) {
        console.error("No vocabulary words found after filtering");
        return;
      }

      // Generate questions from vocabulary words
      const questions = generateReadingQuestions(vocabularyWords, "kanji-to-meaning");
      
      // Initialize the game
      get().initializeGame(questions);
    } catch (error) {
      console.error("Failed to initialize vocabulary reading exercise:", error);
    }
  },
  
  // Check answer function
  handleCheckAnswer: () => {
    const currentQuestion = get().getCurrentQuestion();
    const selectedOption = get().questionState.selectedOption;
    
    if (!currentQuestion || !selectedOption) return;

    const isCorrect = checkAnswer(currentQuestion, selectedOption);
    
    // Set result for UI feedback
    get().setCurrentResult({ isCorrect });
    
    // Add to correct or wrong questions
    if (isCorrect) {
      get().addCorrectQuestion(currentQuestion);
    } else {
      get().addWrongQuestion(currentQuestion);
    }

    // Show bottom sheet with result
    get().setShowBottomSheet(true);
  },
}));