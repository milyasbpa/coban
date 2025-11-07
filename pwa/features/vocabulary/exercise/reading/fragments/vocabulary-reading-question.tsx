"use client";

import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";

export function VocabularyReadingQuestion() {
  const {
    getCurrentQuestion,
    getCurrentQuestionNumber,
    getTotalQuestions,
  } = useVocabularyReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();
  const currentQuestionNumber = getCurrentQuestionNumber();
  const totalQuestions = getTotalQuestions();

  if (!currentQuestion) return null;

  return (
    <div className="space-y-4 mb-8">
      {/* Progress indicator */}
      <div className="text-sm text-muted-foreground text-center">
        Question {currentQuestionNumber} of {totalQuestions}
      </div>
      
      {/* Question */}
      <div className="text-center space-y-2">
        <h2 className="text-lg font-medium text-muted-foreground">
          What does this mean?
        </h2>
        <div className="text-4xl font-bold text-foreground">
          {currentQuestion.japanese}
        </div>
      </div>
    </div>
  );
}