import { create } from "zustand";
import { WritingQuestion } from "../utils";

interface WritingExerciseState {
  // Existing state
  currentQuestionIndex: number;
  selectedKanji: string[];
  correctAnswer: string;
  availableKanji: string[];
  score: number;
  isComplete: boolean;
  showAnswer: boolean;

  // New state moved from container
  questions: WritingQuestion[];
  shuffledKanji: string[];
  showFeedback: boolean;
  isCorrect: boolean;
  activeKanji: string | null;
  usedKanji: string[];
  scoreIntegrated: boolean;
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
  // New drag and drop functions
  insertKanjiAt: (kanji: string, index: number) => void;
  reorderKanji: (fromIndex: number, toIndex: number) => void;

  // New setters for moved state
  setQuestions: (questions: WritingQuestion[]) => void;
  setShuffledKanji: (kanji: string[]) => void;
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
    // Existing state
    currentQuestionIndex: 0,
    selectedKanji: [],
    correctAnswer: "",
    availableKanji: [],
    score: 0,
    isComplete: false,
    showAnswer: false,

    // New state moved from container
    questions: [],
    shuffledKanji: [],
    showFeedback: false,
    isCorrect: false,
    activeKanji: null,
    usedKanji: [],
    scoreIntegrated: false,

    setCurrentQuestionIndex: (index: number) =>
      set({ currentQuestionIndex: index }),

    addKanji: (kanji: string) => {
      const { selectedKanji, availableKanji } = get();
      console.log(availableKanji, kanji, "ini store add kanji");
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
      const userAnswer = selectedKanji.join("");
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        set((state) => ({ score: state.score + 1 }));
      }

      set({ showAnswer: true });
      return isCorrect;
    },

    nextQuestion: () => {
      set((state) => ({
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedKanji: [],
        showAnswer: false,
        usedKanji: [],
        showFeedback: false,
      }));
    },

    resetExercise: () =>
      set({
        currentQuestionIndex: 0,
        selectedKanji: [],
        correctAnswer: "",
        availableKanji: [],
        score: 0,
        isComplete: false,
        showAnswer: false,
        questions: [],
        shuffledKanji: [],
        showFeedback: false,
        isCorrect: false,
        activeKanji: null,
        usedKanji: [],
        scoreIntegrated: false,
      }),

    resetExerciseProgress: () =>
      set({
        currentQuestionIndex: 0,
        selectedKanji: [],
        correctAnswer: "",
        availableKanji: [],
        score: 0,
        isComplete: false,
        showAnswer: false,
        shuffledKanji: [],
        showFeedback: false,
        isCorrect: false,
        activeKanji: null,
        usedKanji: [],
        scoreIntegrated: false,
      }),

    setShowAnswer: (show: boolean) => set({ showAnswer: show }),

    // New drag and drop functions
    insertKanjiAt: (kanji: string, index: number) => {
      const { selectedKanji, availableKanji } = get();
      if (availableKanji.includes(kanji)) {
        const newSelected = [...selectedKanji];
        newSelected.splice(index, 0, kanji);
        set({ selectedKanji: newSelected });
      }
    },

    reorderKanji: (fromIndex: number, toIndex: number) => {
      const { selectedKanji } = get();
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= selectedKanji.length ||
        toIndex >= selectedKanji.length
      ) {
        return;
      }

      const newSelected = [...selectedKanji];
      const [movedKanji] = newSelected.splice(fromIndex, 1);
      newSelected.splice(toIndex, 0, movedKanji);
      set({ selectedKanji: newSelected });
    },

    // New setter implementations
    setQuestions: (questions: WritingQuestion[]) => set({ questions }),

    setShuffledKanji: (kanji: string[]) => set({ shuffledKanji: kanji }),

    setShowFeedback: (show: boolean) => set({ showFeedback: show }),

    setIsCorrect: (correct: boolean) => set({ isCorrect: correct }),

    setActiveKanji: (kanji: string | null) => set({ activeKanji: kanji }),

    setUsedKanji: (kanji: string[]) => set({ usedKanji: kanji }),

    setScoreIntegrated: (integrated: boolean) =>
      set({ scoreIntegrated: integrated }),

    addUsedKanji: (kanji: string) => {
      const { usedKanji } = get();
      if (!usedKanji.includes(kanji)) {
        set({ usedKanji: [...usedKanji, kanji] });
      }
    },

    removeUsedKanji: (kanji: string) => {
      const { usedKanji } = get();
      set({ usedKanji: usedKanji.filter((k) => k !== kanji) });
    },

    clearUsedKanji: () => set({ usedKanji: [] }),

    // Helper function to setup current question
    setupCurrentQuestion: (
      questions: WritingQuestion[],
      currentIndex: number
    ) => {
      const currentQuestion = questions[currentIndex];
      if (!currentQuestion) return;

      // Set the correct answer
      set({ correctAnswer: currentQuestion.kanji });

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

      set({
        shuffledKanji: shuffled,
        availableKanji: shuffled,
        showAnswer: false,
        showFeedback: false,
        usedKanji: [],
      });
    },
  })
);
