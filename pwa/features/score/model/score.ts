export interface UserScore {
  userId: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  category: "kanji";
  createdAt: string;
  updatedAt: string;
  
  // Overall Progress
  overallStats: {
    totalScore: number;
    totalExercisesCompleted: number;
    averageAccuracy: number;
  };
  
  // Lesson Progress (by lesson number or topic)
  lessonProgress: {
    [lessonId: string]: LessonScore;
  };
  
  // Exercise-specific scores
  exerciseScores: {
    writing: ExerciseTypeScore;
    reading: ExerciseTypeScore;
    pairing: ExerciseTypeScore;
  };
  
  // Individual Kanji mastery
  kanjiMastery: {
    [kanjiId: string]: KanjiMasteryLevel;
  };
}

export interface LessonScore {
  lessonId: string;
  level: string;
  category: string;
  
  // Progress metrics
  totalScore: number;
  completionPercentage: number;
  
  // Exercise breakdown
  exercises: {
    writing?: ExerciseAttempt[];
    reading?: ExerciseAttempt[];
    pairing?: ExerciseAttempt[];
  };
  
  // Timestamps
  lastAttempt: string;
  
  // Status
  status: "not_started" | "in_progress" | "completed" | "mastered";
}

export interface ExerciseAttempt {
  attemptId: string;
  lessonId: string;
  exerciseType: "writing" | "reading" | "pairing";
  level: string;
  startTime: string;
  endTime: string;
  
  // Results
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  accuracy: number;
  
  // Detailed answers
  answers: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  kanjiId: string;
  kanji: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ExerciseTypeScore {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  totalCorrect: number;
  totalQuestions: number;
  overallAccuracy: number;
}

export interface KanjiMasteryLevel {
  kanjiId: string;
  character: string;
  level: string;
  
  // Mastery metrics
  masteryLevel: "beginner" | "intermediate" | "advanced" | "master";
  confidenceScore: number; // 0-100
  
  // Learning data
  totalSeen: number;
  totalCorrect: number;
  consecutiveCorrect: number;
  lastSeen: string;
}

export interface OverallProgress {
  currentLevel: string;
  nextLevel: string | null;
  progressToNextLevel: number; // 0-100
  totalKanjiLearned: number;
  masteredKanji: number;
}