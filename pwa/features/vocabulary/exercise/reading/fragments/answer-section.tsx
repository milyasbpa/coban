import React from "react";
import { Button } from "@/pwa/core/components/button";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";

export const AnswerSection: React.FC = () => {
  const {
    getCurrentQuestion,
    questionState: { selectedOption },
    setSelectedOption,
    getIsAnswered,
    getIsCurrentAnswerCorrect,
  } = useVocabularyReadingExerciseStore();

  const { language } = useLanguage();
  const currentQuestion = getCurrentQuestion();
  const isAnswered = getIsAnswered();
  const isCorrect = getIsCurrentAnswerCorrect();

  if (!currentQuestion) return null;

  // Get options based on language setting
  const getDisplayOptions = () => {
    if (!currentQuestion.word?.meanings) {
      return currentQuestion.options; // Fallback to original options
    }

    // Create options based on language preference
    const correctMeaning =
      language === "id"
        ? currentQuestion.word.meanings.id
        : currentQuestion.word.meanings.en;

    // Find other vocabulary words to create wrong options
    // For now, use the original options but translate the correct answer
    return currentQuestion.options.map((option) => {
      if (option === currentQuestion.correctAnswer) {
        return correctMeaning;
      }
      return option; // Keep wrong options as is for now
    });
  };

  console.log(currentQuestion, "ini current question");

  const displayOptions = getDisplayOptions();
  const correctAnswer =
    language === "id"
      ? currentQuestion.word?.meanings?.id || currentQuestion.correctAnswer
      : currentQuestion.word?.meanings?.en || currentQuestion.correctAnswer;

  return (
    <div className="space-y-3">
      {displayOptions.map((option, index) => {
        const isSelected = selectedOption === option;
        let buttonVariant: "default" | "outline" | "destructive" | "secondary" =
          "outline";

        if (isAnswered) {
          if (option === correctAnswer) {
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
