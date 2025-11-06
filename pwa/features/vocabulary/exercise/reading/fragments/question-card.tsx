import React from "react";
import { Card } from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { VocabularyQuestion } from "../../shared/types";
import { playAudio } from "@/pwa/core/lib/utils/audio";

export interface QuestionCardProps {
  question: VocabularyQuestion;
  selectedOption: string | null;
  onOptionSelect: (option: string) => void;
  canCheck: boolean;
  isAnswered: boolean;
  isCorrect?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onOptionSelect,
  canCheck,
  isAnswered,
  isCorrect,
}) => {
  const handlePlayAudio = () => {
    if (question.audio) {
      playAudio(question.audio);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Question Display */}
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {question.japanese}
        </div>
        
        {question.hiragana && (
          <div className="text-xl text-gray-600">
            {question.hiragana}
          </div>
        )}
        
        {question.audio && (
          <Button
            onClick={handlePlayAudio}
            variant="outline"
            className="mx-auto"
          >
            🔊 Play Audio
          </Button>
        )}
        
        <div className="text-lg text-gray-800 font-medium">
          What does this mean?
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          let buttonVariant: "default" | "outline" | "destructive" | "secondary" = "outline";
          
          if (isAnswered) {
            if (option === question.correctAnswer) {
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
              onClick={() => onOptionSelect(option)}
              variant={buttonVariant}
              className="w-full p-4 text-left justify-start h-auto"
              disabled={isAnswered}
            >
              <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};