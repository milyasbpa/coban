import { create } from "zustand";
import { KanjiExample } from "@/pwa/core/services/kanji";
import { integrateWritingGameScore } from "../utils/scoring-integration";

export interface GameState {
  questions: KanjiExample[];
  score: number;
  isComplete: boolean;
  availableCharacters: string[];
  isRetryMode: boolean;
  wrongQuestions: KanjiExample[];
  correctQuestions: KanjiExample[];
}

export interface QuestionState {
  currentQuestionIndex: number;
  selectedKanji: string[];
  correctAnswer: string;
  availableKanji: string[];
  showAnswer: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  activeKanji: string | null;
  usedKanji: string[];
  scoreIntegrated: boolean;
}

interface WritingExerciseState {
  // Semantic State Groups
  gameState: GameState;
  questionState: QuestionState;

  // Computed values
  getCurrentQuestion: () => KanjiExample | null;
  getProgress: () => number;
  getCorrectAnswers: () => number;
  getWrongAnswers: () => number;

  // Actions
  setCurrentQuestionIndex: (index: number) => void;
  addKanji: (kanji: string) => void;
  removeKanji: (index: number) => void;
  clearSelected: () => void;
  setCorrectAnswer: (answer: string) => void;
  setAvailableKanji: (kanji: string[]) => void;
  checkAnswer: () => boolean;
  nextQuestion: () => void;
  handleNextQuestion: (
    calculateWritingScore: (correctQuestions: number | any[], totalQuestions: number) => number,
    level: string,
    updateKanjiMastery: any,
    initializeUser: any,
    isInitialized: boolean,
    currentUserScore: any,
    userId: string | null
  ) => void;
  resetExercise: () => void;
  resetExerciseProgress: () => void;
  setShowAnswer: (show: boolean) => void;

  // Retry actions
  canRetry: () => boolean;
  startRetryMode: () => void;
  addWrongQuestion: (question: KanjiExample) => void;
  addCorrectQuestion: (question: KanjiExample) => void;
  getWrongQuestions: () => KanjiExample[];
  getTotalQuestions: () => number;
  
  // Drag and drop functions
  insertKanjiAt: (kanji: string, index: number) => void;
  reorderKanji: (fromIndex: number, toIndex: number) => void;

  // Setters for gameState
  setQuestions: (questions: KanjiExample[]) => void;
  setAvailableCharacters: (characters: string[]) => void;
  setIsComplete: (complete: boolean) => void;
  
  // Setters for questionState
  setShowFeedback: (show: boolean) => void;
  setIsCorrect: (correct: boolean) => void;
  setActiveKanji: (kanji: string | null) => void;
  setUsedKanji: (kanji: string[]) => void;
  setScoreIntegrated: (integrated: boolean) => void;
  addUsedKanji: (kanji: string) => void;
  removeUsedKanji: (kanji: string) => void;
  clearUsedKanji: () => void;
  setupCurrentQuestion: (
    questions: KanjiExample[],
    currentIndex: number
  ) => void;
}

export const useWritingExerciseStore = create<WritingExerciseState>(
  (set, get) => ({
    // Semantic State Groups
    gameState: {
      questions: [],
      score: 0,
      isComplete: false,
      availableCharacters: [],
      isRetryMode: false,
      wrongQuestions: [],
      correctQuestions: [],
    },
    questionState: {
      currentQuestionIndex: 0,
      selectedKanji: [],
      correctAnswer: "",
      availableKanji: [],
      showAnswer: false,
      showFeedback: false,
      isCorrect: false,
      activeKanji: null,
      usedKanji: [],
      scoreIntegrated: false,
    },

    // Computed values
    getCurrentQuestion: () => {
      const { gameState: { questions, isRetryMode, wrongQuestions }, questionState: { currentQuestionIndex } } = get();
      const questionsToUse = isRetryMode ? wrongQuestions : questions;
      return questionsToUse[currentQuestionIndex] || null;
    },

    getProgress: () => {
      const { gameState: { questions, isRetryMode, wrongQuestions }, questionState: { currentQuestionIndex } } = get();
      const questionsToUse = isRetryMode ? wrongQuestions : questions;
      return questionsToUse.length > 0 ? (currentQuestionIndex / questionsToUse.length) * 100 : 0;
    },

    getCorrectAnswers: () => {
      const { gameState: { score } } = get();
      return score;
    },

    getWrongAnswers: () => {
      const { gameState: { score } } = get();
      const totalQuestions = get().getTotalQuestions();
      return totalQuestions - score;
    },

    // Actions
    setCurrentQuestionIndex: (index: number) =>
      set((state) => ({
        questionState: { ...state.questionState, currentQuestionIndex: index }
      })),

    addKanji: (kanji: string) => {
      const { questionState: { selectedKanji, availableKanji } } = get();
      console.log(availableKanji, kanji, "ini store add kanji");
      if (availableKanji.includes(kanji)) {
        set((state) => ({
          questionState: { 
            ...state.questionState, 
            selectedKanji: [...selectedKanji, kanji] 
          }
        }));
      }
    },

    removeKanji: (index: number) => {
      const { questionState: { selectedKanji } } = get();
      const newSelected = selectedKanji.filter((_, i) => i !== index);
      set((state) => ({
        questionState: { ...state.questionState, selectedKanji: newSelected }
      }));
    },

    clearSelected: () => 
      set((state) => ({
        questionState: { ...state.questionState, selectedKanji: [] }
      })),

    setCorrectAnswer: (answer: string) => 
      set((state) => ({
        questionState: { ...state.questionState, correctAnswer: answer }
      })),

    setAvailableKanji: (kanji: string[]) => 
      set((state) => ({
        questionState: { ...state.questionState, availableKanji: kanji }
      })),

    checkAnswer: () => {
      const { 
        gameState: { questions, isRetryMode },
        questionState: { selectedKanji, correctAnswer, currentQuestionIndex } 
      } = get();
      const userAnswer = selectedKanji.join("");
      const isCorrect = userAnswer === correctAnswer;
      
      const currentQuestion = isRetryMode 
        ? get().gameState.wrongQuestions[currentQuestionIndex]
        : questions[currentQuestionIndex];

      if (isCorrect) {
        set((state) => ({
          gameState: { 
            ...state.gameState, 
            score: state.gameState.score + 1,
            correctQuestions: [...state.gameState.correctQuestions, currentQuestion]
          }
        }));
      } else {
        // Add to wrong questions if not already there
        set((state) => {
          const alreadyWrong = state.gameState.wrongQuestions.some(q => q.id === currentQuestion.id);
          return {
            gameState: {
              ...state.gameState,
              wrongQuestions: alreadyWrong 
                ? state.gameState.wrongQuestions
                : [...state.gameState.wrongQuestions, currentQuestion]
            }
          };
        });
      }

      set((state) => ({
        questionState: { ...state.questionState, showAnswer: true }
      }));
      return isCorrect;
    },

    nextQuestion: () => {
      const { gameState: { questions, isRetryMode, wrongQuestions }, questionState: { currentQuestionIndex } } = get();
      const questionsToUse = isRetryMode ? wrongQuestions : questions;
      
      set((state) => ({
        questionState: {
          ...state.questionState,
          selectedKanji: [],
          showAnswer: false,
          usedKanji: [],
          showFeedback: false,
        }
      }));

      if (currentQuestionIndex + 1 < questionsToUse.length) {
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

    handleNextQuestion: (calculateWritingScore, level, updateKanjiMastery, initializeUser, isInitialized, currentUserScore, userId) => {
      const { 
        gameState: { correctQuestions, isRetryMode, score, questions, wrongQuestions }, 
        getTotalQuestions,
        questionState: { currentQuestionIndex },
        nextQuestion: next 
      } = get();
      
      // Calculate final score before moving to next question if this is the last question
      const totalQuestions = getTotalQuestions();
      const questionsToUse = isRetryMode ? wrongQuestions : questions;
      const currentQuestionNumber = currentQuestionIndex + 1;
      const isLastQuestion = currentQuestionNumber === questionsToUse.length;
      
      if (isLastQuestion) {
        let finalScore;
        
        if (isRetryMode) {
          // Retry mode scoring: current score + (correct answers * points per original question)
          const pointsPerOriginalQuestion = 100 / questions.length;
          const bonusPoints = correctQuestions.length * pointsPerOriginalQuestion;
          finalScore = Math.min(100, score + bonusPoints);
        } else {
          // Normal mode scoring  
          finalScore = calculateWritingScore(score, totalQuestions);
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
              await integrateWritingGameScore(
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
            console.error("Error integrating writing game score:", error);
          }
        })();
      }
      
      next();
    },

    resetExercise: () =>
      set({
        gameState: {
          questions: [],
          score: 0,
          isComplete: false,
          availableCharacters: [],
          isRetryMode: false,
          wrongQuestions: [],
          correctQuestions: [],
        },
        questionState: {
          currentQuestionIndex: 0,
          selectedKanji: [],
          correctAnswer: "",
          availableKanji: [],
          showAnswer: false,
          showFeedback: false,
          isCorrect: false,
          activeKanji: null,
          usedKanji: [],
          scoreIntegrated: false,
        },
      }),

    resetExerciseProgress: () =>
      set({
        gameState: {
          questions: [],
          score: 0,
          isComplete: false,
          availableCharacters: [],
          isRetryMode: false,
          wrongQuestions: [],
          correctQuestions: [],
        },
        questionState: {
          currentQuestionIndex: 0,
          selectedKanji: [],
          correctAnswer: "",
          availableKanji: [],
          showAnswer: false,
          showFeedback: false,
          isCorrect: false,
          activeKanji: null,
          usedKanji: [],
          scoreIntegrated: false,
        },
      }),

    setShowAnswer: (show: boolean) => 
      set((state) => ({
        questionState: { ...state.questionState, showAnswer: show }
      })),

    // New drag and drop functions
    insertKanjiAt: (kanji: string, index: number) => {
      const { questionState } = get();
      if (questionState.availableKanji.includes(kanji)) {
        const newSelected = [...questionState.selectedKanji];
        newSelected.splice(index, 0, kanji);
        set((state) => ({
          questionState: { ...state.questionState, selectedKanji: newSelected }
        }));
      }
    },

    reorderKanji: (fromIndex: number, toIndex: number) => {
      const { questionState } = get();
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= questionState.selectedKanji.length ||
        toIndex >= questionState.selectedKanji.length
      ) {
        return;
      }

      const newSelected = [...questionState.selectedKanji];
      const [movedKanji] = newSelected.splice(fromIndex, 1);
      newSelected.splice(toIndex, 0, movedKanji);
      set((state) => ({
        questionState: { ...state.questionState, selectedKanji: newSelected }
      }));
    },

    // New setter implementations
    setQuestions: (questions: KanjiExample[]) => 
      set((state) => ({
        gameState: { ...state.gameState, questions }
      })),

    setAvailableCharacters: (characters: string[]) => 
      set((state) => ({
        gameState: { ...state.gameState, availableCharacters: characters }
      })),

    setShowFeedback: (show: boolean) => 
      set((state) => ({
        questionState: { ...state.questionState, showFeedback: show }
      })),

    setIsCorrect: (correct: boolean) => 
      set((state) => ({
        questionState: { ...state.questionState, isCorrect: correct }
      })),

    setActiveKanji: (kanji: string | null) => 
      set((state) => ({
        questionState: { ...state.questionState, activeKanji: kanji }
      })),

    setUsedKanji: (kanji: string[]) => 
      set((state) => ({
        questionState: { ...state.questionState, usedKanji: kanji }
      })),

    setScoreIntegrated: (integrated: boolean) =>
      set((state) => ({
        questionState: { ...state.questionState, scoreIntegrated: integrated }
      })),

    setIsComplete: (complete: boolean) =>
      set((state) => ({
        gameState: { ...state.gameState, isComplete: complete }
      })),

    addUsedKanji: (kanji: string) => {
      const { questionState } = get();
      if (!questionState.usedKanji.includes(kanji)) {
        set((state) => ({
          questionState: { 
            ...state.questionState, 
            usedKanji: [...state.questionState.usedKanji, kanji] 
          }
        }));
      }
    },

    removeUsedKanji: (kanji: string) => {
      set((state) => ({
        questionState: {
          ...state.questionState,
          usedKanji: state.questionState.usedKanji.filter((k: string) => k !== kanji)
        }
      }));
    },

    clearUsedKanji: () => 
      set((state) => ({
        questionState: { ...state.questionState, usedKanji: [] }
      })),

    // Helper function to setup current question
    setupCurrentQuestion: (
      questions: KanjiExample[],
      currentIndex: number
    ) => {
      const currentQuestion = questions[currentIndex];
      if (!currentQuestion) return;

      // Set the correct answer
      set((state) => ({
        questionState: { ...state.questionState, correctAnswer: currentQuestion.word }
      }));

      // Create shuffled kanji array for selection
      const correctChars = currentQuestion.word.split("");

      // Get some random kanji from other questions as distractors
      const otherKanji = questions
        .filter((_, index) => index !== currentIndex)
        .flatMap((q) => q.word.split(""))
        .filter((char, index, arr) => arr.indexOf(char) === index); // Remove duplicates from other questions

      // Combine correct chars with other kanji, ensuring no duplicates
      const allUniqueChars = new Set([...correctChars, ...otherKanji]);
      const allOptions = Array.from(allUniqueChars);

      // Take only what we need (ensure we have enough options but not too many)
      const finalOptions = allOptions.slice(
        0,
        Math.max(8, correctChars.length + 5)
      );

      // Shuffle the options
      const shuffled = finalOptions.sort(() => Math.random() - 0.5);

      set((state) => ({
        gameState: {
          ...state.gameState,
          availableCharacters: shuffled,
        },
        questionState: {
          ...state.questionState,
          availableKanji: shuffled,
          showAnswer: false,
          showFeedback: false,
          usedKanji: [],
        }
      }));
    },

    // Retry system implementation
    canRetry: () => {
      const { gameState: { wrongQuestions, isRetryMode } } = get();
      return wrongQuestions.length > 0 && !isRetryMode;
    },

    startRetryMode: () => {
      const { gameState: { wrongQuestions, score } } = get();
      if (wrongQuestions.length === 0) return;
      
      set({
        gameState: {
          questions: wrongQuestions, // Use wrong questions as new question set
          correctQuestions: [],
          isComplete: false,
          isRetryMode: true,
          wrongQuestions: [],
          availableCharacters: [],
          score: score, // Keep current score
        },
        questionState: {
          currentQuestionIndex: 0,
          selectedKanji: [],
          correctAnswer: "",
          availableKanji: [],
          showAnswer: false,
          showFeedback: false,
          isCorrect: false,
          activeKanji: null,
          usedKanji: [],
          scoreIntegrated: false,
        },
      });

      // Setup first retry question
      const { gameState: { questions } } = get(); 
      get().setupCurrentQuestion(questions, 0);
    },

    addWrongQuestion: (question: KanjiExample) => {
      set((state) => ({
        gameState: {
          ...state.gameState,
          wrongQuestions: [...state.gameState.wrongQuestions, question]
        }
      }));
    },

    addCorrectQuestion: (question: KanjiExample) => {
      set((state) => ({
        gameState: {
          ...state.gameState,
          correctQuestions: [...state.gameState.correctQuestions, question]
        }
      }));
    },

    getWrongQuestions: () => {
      const { gameState: { wrongQuestions } } = get();
      return wrongQuestions;
    },

    getTotalQuestions: () => {
      const { gameState: { questions, isRetryMode, wrongQuestions } } = get();
      return isRetryMode ? wrongQuestions.length : questions.length;
    },
  })
);
