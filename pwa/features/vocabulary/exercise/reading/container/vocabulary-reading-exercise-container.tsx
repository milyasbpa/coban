"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { ProgressBar } from "../fragments/progress-bar";
import { QuestionCard } from "../fragments/question-card";
import { ControlButtons } from "../fragments/control-buttons";
import { ResultCard } from "../fragments/result-card";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { generateReadingQuestions, calculateScore, checkAnswer } from "../utils/vocabulary-reading.utils";

interface VocabularyReadingExerciseContainerProps {
  level: string;
  categoryId: string;
}

export const VocabularyReadingExerciseContainer: React.FC<VocabularyReadingExerciseContainerProps> = ({
  level,
  categoryId,
}) => {
  const router = useRouter();
  const store = useVocabularyReadingExerciseStore();
  useEffect(() => {
    initializeExercise();
  }, [level, categoryId]);

  const initializeExercise = async () => {
    try {
      // Get vocabulary category
      const vocabularyCategory = VocabularyService.getVocabularyByCategoryString(categoryId, level);
      
      if (!vocabularyCategory || vocabularyCategory.vocabulary.length < 4) {
        console.error("Not enough vocabulary words for exercise");
        return;
      }

      // Generate questions from vocabulary words
      const questions = generateReadingQuestions(vocabularyCategory.vocabulary, "kanji-to-meaning");
      
      // Initialize the game
      store.initializeGame(questions);
    } catch (error) {
      console.error("Failed to initialize vocabulary reading exercise:", error);
    }
  };

  const handleCheckAnswer = () => {
    const currentQuestion = store.getCurrentQuestion();
    if (!currentQuestion || !store.questionState.selectedOption) return;

    const isCorrect = checkAnswer(currentQuestion, store.questionState.selectedOption);
    
    // Set result for UI feedback
    store.setCurrentResult({ isCorrect });
    
    // Add to correct or wrong questions
    if (isCorrect) {
      store.addCorrectQuestion(currentQuestion);
    } else {
      store.addWrongQuestion(currentQuestion);
    }

    // Show bottom sheet with result
    store.setShowBottomSheet(true);
  };

  const handleNextQuestion = () => {
    store.handleNextQuestion(calculateScore);
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (store.gameState.isComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ResultCard
          score={store.gameState.score}
          correctAnswers={store.getCorrectAnswers()}
          wrongAnswers={store.getWrongAnswers()}
          totalQuestions={store.getTotalQuestions()}
          canRetry={store.canRetry()}
          onRestart={store.restartGame}
          onRetry={store.startRetryMode}
          onBackToHome={handleBackToHome}
        />
      </div>
    );
  }

  const currentQuestion = store.getCurrentQuestion();

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <ProgressBar
        progress={store.getCurrentQuestionNumber()}
        maxProgress={store.getTotalQuestions()}
      />

      <QuestionCard
        question={currentQuestion}
        selectedOption={store.questionState.selectedOption}
        onOptionSelect={store.setSelectedOption}
        canCheck={store.getCanCheck()}
        isAnswered={store.getIsAnswered()}
        isCorrect={store.getIsCurrentAnswerCorrect()}
      />

      <ControlButtons
        canCheck={store.getCanCheck()}
        isAnswered={store.getIsAnswered()}
        isCorrect={store.getIsCurrentAnswerCorrect()}
        onCheck={handleCheckAnswer}
        onNext={handleNextQuestion}
        onResetAnswer={store.resetAnswer}
      />
    </div>
  );
};