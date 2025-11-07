"use client";

import { Button } from "@/pwa/core/components/button";
import { Check, ArrowRight } from "lucide-react";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";

export function VocabularyReadingCheckButton() {
  const {
    getCanCheck,
    getIsAnswered,
    handleCheckAnswer,
    handleNextQuestion,
  } = useVocabularyReadingExerciseStore();

  const canCheck = getCanCheck();
  const isAnswered = getIsAnswered();

  const handleNext = () => {
    handleNextQuestion((correctQuestions, totalQuestions) => {
      return Math.round((correctQuestions.length / totalQuestions) * 100);
    });
  };

  if (isAnswered) {
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={handleNext}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full shadow-lg"
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          Next
        </Button>
      </div>
    );
  }

  if (canCheck) {
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={handleCheckAnswer}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg"
        >
          <Check className="w-5 h-5 mr-2" />
          Check
        </Button>
      </div>
    );
  }

  return null;
}