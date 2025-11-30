import React from "react";
import { Card } from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { Input } from "@/pwa/core/components/input";
import { VocabularyQuestion } from "../../shared/types";
import { playAudio } from "@/pwa/core/lib/utils/audio";

export interface WritingQuestionCardProps {
  question: VocabularyQuestion;
  userInput: string;
  onInputChange: (input: string) => void;
  inputMode: "romaji" | "hiragana" | "kanji";
  onInputModeChange: (mode: "romaji" | "hiragana" | "kanji") => void;
  canCheck: boolean;
  isAnswered: boolean;
  isCorrect?: boolean;
}

export const WritingQuestionCard: React.FC<WritingQuestionCardProps> = ({
  question,
  userInput,
  onInputChange,
  inputMode,
  onInputModeChange,
  canCheck,
  isAnswered,
  isCorrect,
}) => {
  const handlePlayAudio = () => {
    if (question.audio) {
      playAudio(question.audio);
    }
  };

  const getPlaceholder = () => {
    switch (inputMode) {
      case "romaji":
        return "Type in romaji (e.g., konnichiwa)";
      case "hiragana":
        return "Type in hiragana (e.g., こんにちわ)";
      case "kanji":
        return "Type in kanji (e.g., 今日は)";
      default:
        return "Type your answer";
    }
  };

  const getExpectedAnswer = () => {
    switch (inputMode) {
      case "romaji":
        return question.word.romaji;
      case "hiragana":
        return question.word.hiragana;
      case "kanji":
        return question.word.kanji || question.word.hiragana;
      default:
        return question.word.romaji;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Question Display */}
      <div className="text-center space-y-4">
        <div className="text-lg text-foreground/80 font-medium">
          Write the {inputMode} for:
        </div>
        
        <div className="text-2xl font-bold text-foreground mb-2">
          {question.word.meanings.id}
        </div>
        
        <div className="text-lg text-muted-foreground">
          ({question.word.meanings.en})
        </div>
        
        {question.audio && (
          <Button
            onClick={handlePlayAudio}
            variant="outline"
            className="mx-auto"
          >
            🔊 Play Audio
          </Button>
        )}
      </div>

      {/* Input Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex rounded-lg border border-border bg-muted/20 p-1">
          {["romaji", "hiragana", "kanji"].map((mode) => (
            <Button
              key={mode}
              onClick={() => onInputModeChange(mode as any)}
              variant={inputMode === mode ? "default" : "ghost"}
              size="sm"
              className="capitalize"
              disabled={isAnswered}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="space-y-3">
        <Input
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={getPlaceholder()}
          className={`w-full text-center text-lg p-4 ${
            isAnswered
              ? isCorrect
                ? "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/20"
                : "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/20"
              : ""
          }`}
          disabled={isAnswered}
        />
        
        {isAnswered && !isCorrect && (
          <div className="text-center space-y-2">
            <div className="text-sm text-red-600 dark:text-red-400">
              Your answer: <span className="font-medium">{userInput}</span>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Correct answer: <span className="font-medium">{getExpectedAnswer()}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
