// Example integration helper for reading exercise
import { ExerciseAttempt, QuestionResult } from "@/pwa/features/score/model/score";
import { ReadingGameStats, AnswerResult } from "../utils/reading-game";

export class ReadingExerciseIntegration {
  /**
   * Convert reading exercise data to score system format
   */
  static createExerciseAttempt(
    lessonId: string,
    level: string,
    startTime: string,
    endTime: string,
    gameStats: ReadingGameStats,
    answers: AnswerResult[]
  ): ExerciseAttempt {
    const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
    
    const questionResults: QuestionResult[] = answers.map((answer, index) => ({
      questionId: `reading_${lessonId}_${index}`,
      kanjiId: answer.kanji, // Assuming kanji character is the ID
      kanji: answer.kanji,
      userAnswer: answer.userAnswer,
      correctAnswer: answer.correctAnswer,
      isCorrect: answer.isCorrect,
      timeSpent: 10, // Estimate based on total duration / questions
      difficulty: "medium" as const // Could be determined by kanji complexity
    }));
    
    return {
      attemptId: `reading_${lessonId}_${Date.now()}`,
      lessonId,
      exerciseType: "reading",
      level,
      startTime,
      endTime,
      duration,
      totalQuestions: gameStats.totalQuestions,
      correctAnswers: gameStats.correctAnswers,
      wrongAnswers: gameStats.wrongAnswers,
      score: gameStats.score, // Will be recalculated by ScoreCalculator
      accuracy: (gameStats.correctAnswers / gameStats.totalQuestions) * 100,
      answers: questionResults
    };
  }
  
  /**
   * Extract kanji mastery data from reading exercise
   */
  static extractKanjiResults(answers: AnswerResult[]): Map<string, QuestionResult[]> {
    const kanjiResults = new Map<string, QuestionResult[]>();
    
    answers.forEach((answer, index) => {
      const questionResult: QuestionResult = {
        questionId: `reading_${index}`,
        kanjiId: answer.kanji,
        kanji: answer.kanji,
        userAnswer: answer.userAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
        timeSpent: 10, // Estimate
        difficulty: "medium" as const
      };
      
      if (!kanjiResults.has(answer.kanji)) {
        kanjiResults.set(answer.kanji, []);
      }
      kanjiResults.get(answer.kanji)!.push(questionResult);
    });
    
    return kanjiResults;
  }
}