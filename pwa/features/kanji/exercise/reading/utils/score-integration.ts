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
    gameStats: ReadingGameStats,
    answers: AnswerResult[]
  ): ExerciseAttempt {
    const questionResults: QuestionResult[] = answers.map((answer, index) => ({
      kanjiId: answer.kanji, // Assuming kanji character is the ID
      kanji: answer.kanji,
      isCorrect: answer.isCorrect,
    }));
    
    return {
      attemptId: `reading_${lessonId}_${Date.now()}`,
      lessonId,
      exerciseType: "reading",
      level,
      totalQuestions: gameStats.totalQuestions,
      correctAnswers: gameStats.correctAnswers,
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
        kanjiId: answer.kanji,
        kanji: answer.kanji,
        isCorrect: answer.isCorrect,
      };
      
      if (!kanjiResults.has(answer.kanji)) {
        kanjiResults.set(answer.kanji, []);
      }
      kanjiResults.get(answer.kanji)!.push(questionResult);
    });
    
    return kanjiResults;
  }
}