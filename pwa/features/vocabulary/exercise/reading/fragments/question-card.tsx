import React from "react";
import { Card } from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";

export const QuestionCard: React.FC = () => {
  const {
    getCurrentQuestion,
    questionState: { selectedOption },
    setSelectedOption,
    getIsAnswered,
    getIsCurrentAnswerCorrect,
  } = useVocabularyReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();

  const isAnswered = getIsAnswered();
  const isCorrect = getIsCurrentAnswerCorrect();

  if (!currentQuestion) return null;

  return (
    <div className="space-y-3">
      {currentQuestion.options.map((option, index) => {
        const isSelected = selectedOption === option;
        let buttonVariant: "default" | "outline" | "destructive" | "secondary" =
          "outline";

        if (isAnswered) {
          if (option === currentQuestion.correctAnswer) {
            buttonVariant = "default"; // Correct answer is green
          } else if (isSelected && !isCorrect) {
            buttonVariant = "destructive"; // Wrong selected answer is red
          } else {
            buttonVariant = "secondary"; // Other options are muted
          }
        } else if (isSelected) {
          buttonVariant = "default"; // Selected option before checking
        }

        return (
          <Button
            key={index}
            onClick={() => setSelectedOption(option)}
            variant={buttonVariant}
            className="w-full p-4 text-left justify-start h-auto"
            disabled={isAnswered}
          >
            <span className="mr-3 font-bold">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </Button>
        );
      })}
    </div>
  );
};
