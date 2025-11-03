export interface UserScore {
  userId: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  category: "kanji" | "vocabulary" | "grammar" | "listening";
  createdAt: string;
  updatedAt: string;
  
  // Overall Progress
  overallStats: {
    totalScore: number;
    totalExercisesCompleted: number;
    averageAccuracy: number;
    studyTimeMinutes: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
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
  lessonNumber?: number;
  topicId?: string;
  level: string;
  category: string;
  
  // Progress metrics
  totalScore: number;
  maxPossibleScore: number;
  completionPercentage: number;
  
  // Exercise breakdown
  exercises: {
    writing?: ExerciseAttempt[];
    reading?: ExerciseAttempt[];
    pairing?: ExerciseAttempt[];
  };
  
  // Timestamps
  firstAttempt: string;
  lastAttempt: string;
  bestAttempt?: ExerciseAttempt;
  
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
  duration: number; // seconds
  
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
  timeSpent: number; // seconds
  difficulty: "easy" | "medium" | "hard";
}

export interface ExerciseTypeScore {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  totalCorrect: number;
  totalQuestions: number;
  overallAccuracy: number;
  averageTimePerQuestion: number;
  
  // Progress over time
  recentAttempts: ExerciseAttempt[];
  progressTrend: "improving" | "stable" | "declining";
}

export interface KanjiMasteryLevel {
  kanjiId: string;
  character: string;
  level: string;
  
  // Mastery metrics
  masteryLevel: "beginner" | "intermediate" | "advanced" | "master";
  confidenceScore: number; // 0-100
  
  // Exercise-specific mastery
  writingMastery: number; // 0-100
  readingMastery: number; // 0-100
  pairingMastery: number; // 0-100
  
  // Learning data
  totalSeen: number;
  totalCorrect: number;
  consecutiveCorrect: number;
  lastSeen: string;
  
  // Difficulty adaptation
  adaptiveDifficulty: "easy" | "medium" | "hard";
  nextReviewDate: string;
}

export interface LearningAnalytics {
  // Performance trends
  performanceTrend: {
    daily: DailyProgress[];
    weekly: WeeklyProgress[];
    monthly: MonthlyProgress[];
  };
  
  // Strengths & Weaknesses
  strongKanji: KanjiMasteryLevel[];
  weakKanji: KanjiMasteryLevel[];
  
  // Study patterns
  studyHeatmap: { date: string; sessionsCount: number; totalTime: number }[];
  peakPerformanceTime: { hour: number; averageScore: number }[];
  
  // Recommendations
  suggestedReviews: string[]; // kanji IDs that need review
  suggestedLessons: string[]; // lesson IDs to focus on
}

export interface DailyProgress {
  date: string;
  totalScore: number;
  exercisesCompleted: number;
  accuracy: number;
  studyTime: number;
}

export interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  totalScore: number;
  exercisesCompleted: number;
  averageAccuracy: number;
  totalStudyTime: number;
}

export interface MonthlyProgress {
  month: string;
  year: number;
  totalScore: number;
  exercisesCompleted: number;
  averageAccuracy: number;
  totalStudyTime: number;
}

export interface OverallProgress {
  currentLevel: string;
  nextLevel: string | null;
  progressToNextLevel: number; // 0-100
  totalKanjiLearned: number;
  masteredKanji: number;
  streakInfo: {
    current: number;
    longest: number;
    lastStudyDate: string;
  };
}