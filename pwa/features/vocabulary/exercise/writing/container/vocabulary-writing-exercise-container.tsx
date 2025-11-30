"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVocabularyWritingExerciseStore } from "../store/vocabulary-writing-exercise.store";
import { VocabularyWritingHeader } from "../fragments/vocabulary-writing-header";
import { WritingQuestionCard } from "../fragments/writing-question-card";
import { WritingControlButtons } from "../fragments/writing-control-buttons";
import { VocabularyWritingGameResult } from "../fragments/vocabulary-writing-game-result";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { generateWritingQuestions } from "../utils/vocabulary-writing.utils";

export const VocabularyWritingExerciseContainer: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useVocabularyWritingExerciseStore();

  const level = searchParams.get("level") || "n5";
  const categoryId = searchParams.get("categoryId") || "ANGKA";

  useEffect(() => {
    initializeExercise();
  }, [level, categoryId]);

  const initializeExercise = async () => {
    try {
      // Get vocabulary category
      const vocabularyCategory = VocabularyService.getVocabularyByCategoryString(categoryId, level);
      
      if (!vocabularyCategory || vocabularyCategory.vocabulary.length < 1) {
        console.error("Not enough vocabulary words for exercise");
        return;
      }

      // Generate questions from vocabulary words
      const questions = generateWritingQuestions(vocabularyCategory.vocabulary, "meaning-to-romaji");
      
      // Initialize the game with level and categoryId for score integration
      store.initializeGame(questions, level, categoryId);
    } catch (error) {
      console.error("Failed to initialize vocabulary writing exercise:", error);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (store.gameState.isComplete) {
    return <VocabularyWritingGameResult />;
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
    <div className="min-h-screen bg-background">
      <VocabularyWritingHeader />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <WritingQuestionCard />
        <WritingControlButtons />
      </div>
    </div>
  );
};