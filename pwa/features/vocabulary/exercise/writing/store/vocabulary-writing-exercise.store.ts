import { create } from "zustand";
import { VocabularyQuestion, VocabularyExerciseWord } from "../../shared/types";
import { CharacterTile } from "../utils/generate-character-tiles";
import { integrateVocabularyWritingExerciseScore } from "../utils/scoring-integration";

export interface VocabularyWritingGameState {
  questions: VocabularyQuestion[];
  correctQuestions: VocabularyQuestion[];
  isComplete: boolean;
  isRetryMode: boolean;
  wrongQuestions: VocabularyQuestion[];
  score: number;
  level: string;
  categoryId: string;
  distractorPool?: VocabularyQuestion[]; // All questions from category for distractors
}

export interface VocabularyWritingQuestionState {
  currentQuestionIndex: number;
  inputMode: "hiragana" | "kanji";
  availableTiles: CharacterTile[];
  selectedCharacters: string[];
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
  getSelectedAnswer: () => string;
  getAvailableTiles: () => CharacterTile[];
  getDistractorPool: () => VocabularyQuestion[] | undefined;

  // Actions
  setQuestions: (questions: VocabularyQuestion[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setInputMode: (mode: "hiragana" | "kanji") => void;
  setAvailableTiles: (tiles: CharacterTile[]) => void;
  setSelectedCharacters: (characters: string[]) => void;
  selectTile: (tileId: string) => void;
  deselectCharacter: (index: number) => void;
  clearSelection: () => void;
  setShowBottomSheet: (show: boolean) => void;
  setCurrentResult: (result: any | null) => void;
  setIsComplete: (complete: boolean) => void;
  
  // Game flow actions
  initializeGame: (questions: VocabularyQuestion[], level: string, categoryId: string, distractorPool?: VocabularyQuestion[]) => void;
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
    categoryId: string,
    userId: string | null
  ) => void;
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
    level: "n5",
    categoryId: "ANGKA",
    distractorPool: undefined,
  },
  questionState: {
    currentQuestionIndex: 0,
    inputMode: "hiragana",
    availableTiles: [],
    selectedCharacters: [],
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
    const { questionState: { selectedCharacters } } = get();
    return selectedCharacters.length > 0;
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

  getSelectedAnswer: () => {
    const { questionState: { selectedCharacters } } = get();
    return selectedCharacters.join("");
  },

  getAvailableTiles: () => {
    const { questionState: { availableTiles } } = get();
    return availableTiles;
  },

  getDistractorPool: () => {
    const { gameState: { distractorPool } } = get();
    return distractorPool;
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
  
  setAvailableTiles: (tiles) =>
    set((state) => ({
      questionState: { ...state.questionState, availableTiles: tiles }
    })),

  setSelectedCharacters: (characters) =>
    set((state) => ({
      questionState: { ...state.questionState, selectedCharacters: characters }
    })),

  selectTile: (tileId) => {
    const { questionState: { availableTiles, selectedCharacters } } = get();
    const tile = availableTiles.find(t => t.id === tileId);
    
    if (tile && !tile.isUsed) {
      const updatedTiles = availableTiles.map(t =>
        t.id === tileId ? { ...t, isUsed: true } : t
      );
      
      set((state) => ({
        questionState: {
          ...state.questionState,
          availableTiles: updatedTiles,
          selectedCharacters: [...selectedCharacters, tile.character]
        }
      }));
    }
  },

  deselectCharacter: (index) => {
    const { questionState: { availableTiles, selectedCharacters } } = get();
    const character = selectedCharacters[index];
    
    // Find the tile with this character that was used
    const tileToRestore = availableTiles.find(t => 
      t.character === character && t.isUsed
    );
    
    if (tileToRestore) {
      const updatedTiles = availableTiles.map(t =>
        t.id === tileToRestore.id ? { ...t, isUsed: false } : t
      );
      
      const updatedSelection = selectedCharacters.filter((_, i) => i !== index);
      
      set((state) => ({
        questionState: {
          ...state.questionState,
          availableTiles: updatedTiles,
          selectedCharacters: updatedSelection
        }
      }));
    }
  },

  clearSelection: () => {
    const { questionState: { availableTiles } } = get();
    const resetTiles = availableTiles.map(t => ({ ...t, isUsed: false }));
    
    set((state) => ({
      questionState: {
        ...state.questionState,
        availableTiles: resetTiles,
        selectedCharacters: []
      }
    }));
  },
  
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
  initializeGame: (questions, level, categoryId, distractorPool) => set({
    gameState: {
      questions,
      correctQuestions: [],
      isComplete: false,
      isRetryMode: false,
      wrongQuestions: [],
      score: 0,
      level,
      categoryId,
      distractorPool,
    },
    questionState: {
      currentQuestionIndex: 0,
      inputMode: "hiragana",
      availableTiles: [],
      selectedCharacters: [],
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
        selectedCharacters: [],
        availableTiles: [],
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
        selectedCharacters: [],
        availableTiles: state.questionState.availableTiles.map(t => ({ ...t, isUsed: false })),
        showBottomSheet: false,
        currentResult: null
      }
    })),

  restartGame: () => {
    const { gameState: { questions, level, categoryId, distractorPool } } = get();
    set({
      gameState: {
        questions,
        correctQuestions: [],
        isComplete: false,
        isRetryMode: false,
        wrongQuestions: [],
        score: 0,
        level,
        categoryId,
        distractorPool,
      },
      questionState: {
        currentQuestionIndex: 0,
        inputMode: "hiragana",
        availableTiles: [],
        selectedCharacters: [],
        showBottomSheet: false,
        currentResult: null,
      }
    });
  },

  startRetryMode: () => {
    const { gameState: { wrongQuestions, score, questions, level, categoryId } } = get();
    if (wrongQuestions.length === 0) return;
    
    set({
      gameState: {
        questions: [...questions],
        correctQuestions: [],
        isComplete: false,
        isRetryMode: true,
        wrongQuestions: wrongQuestions,
        score: score,
        level,
        categoryId,
      },
      questionState: {
        currentQuestionIndex: 0,
        inputMode: "hiragana",
        availableTiles: [],
        selectedCharacters: [],
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

  handleNextQuestion: (calculateScore, level, categoryId, userId) => {
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

      // Integrate vocabulary scoring at game completion
      (async () => {
        try {
          // Only save if userId is provided (authenticated user)
          if (userId) {
            await integrateVocabularyWritingExerciseScore(
              questions,
              wrongQuestions,
              correctQuestions,
              level,
              categoryId,
              userId
            );
          }
        } catch (error) {
          console.error(
            "Error integrating vocabulary writing game score:",
            error
          );
        }
      })();
    }
    
    next();
  },
}));