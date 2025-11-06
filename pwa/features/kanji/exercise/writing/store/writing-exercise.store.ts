import { create } from "zustand";
import { WritingQuestion } from "../utils";

export interface GameState {
  questions: WritingQuestion[];
  score: number;
  isComplete: boolean;
  shuffledKanji: string[];
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
  getCurrentQuestion: () => WritingQuestion | null;
  getProgress: () => number;

  // Actions
  setCurrentQuestionIndex: (index: number) => void;
  addKanji: (kanji: string) => void;
  removeKanji: (index: number) => void;
  clearSelected: () => void;
  setCorrectAnswer: (answer: string) => void;
  setAvailableKanji: (kanji: string[]) => void;
  checkAnswer: () => boolean;
  nextQuestion: () => void;
  resetExercise: () => void;
  resetExerciseProgress: () => void;
  setShowAnswer: (show: boolean) => void;
  
  // Drag and drop functions
  insertKanjiAt: (kanji: string, index: number) => void;
  reorderKanji: (fromIndex: number, toIndex: number) => void;

  // Setters for gameState
  setQuestions: (questions: WritingQuestion[]) => void;
  setShuffledKanji: (kanji: string[]) => void;
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
    questions: WritingQuestion[],
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
      shuffledKanji: [],
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
      const { gameState: { questions }, questionState: { currentQuestionIndex } } = get();
      return questions[currentQuestionIndex] || null;
    },

    getProgress: () => {
      const { gameState: { questions }, questionState: { currentQuestionIndex } } = get();
      return questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;
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
      const { questionState: { selectedKanji, correctAnswer } } = get();
      const userAnswer = selectedKanji.join("");
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        set((state) => ({
          gameState: { ...state.gameState, score: state.gameState.score + 1 }
        }));
      }

      set((state) => ({
        questionState: { ...state.questionState, showAnswer: true }
      }));
      return isCorrect;
    },

    nextQuestion: () => {
      set((state) => ({
        questionState: {
          ...state.questionState,
          currentQuestionIndex: state.questionState.currentQuestionIndex + 1,
          selectedKanji: [],
          showAnswer: false,
          usedKanji: [],
          showFeedback: false,
        }
      }));
    },

    resetExercise: () =>
      set({
        gameState: {
          questions: [],
          score: 0,
          isComplete: false,
          shuffledKanji: [],
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
          shuffledKanji: [],
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
    setQuestions: (questions: WritingQuestion[]) => 
      set((state) => ({
        gameState: { ...state.gameState, questions }
      })),

    setShuffledKanji: (kanji: string[]) => 
      set((state) => ({
        gameState: { ...state.gameState, shuffledKanji: kanji }
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
      questions: WritingQuestion[],
      currentIndex: number
    ) => {
      const currentQuestion = questions[currentIndex];
      if (!currentQuestion) return;

      // Set the correct answer
      set((state) => ({
        questionState: { ...state.questionState, correctAnswer: currentQuestion.kanji }
      }));

      // Create shuffled kanji array for selection
      const correctChars = currentQuestion.kanji.split("");

      // Get some random kanji from other questions as distractors
      const otherKanji = questions
        .filter((_, index) => index !== currentIndex)
        .flatMap((q) => q.kanji.split(""))
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
          shuffledKanji: shuffled,
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
  })
);
