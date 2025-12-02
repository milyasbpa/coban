import React from "react";
import { Card } from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { VocabularyQuestion } from "../../shared/types";
import { playAudio } from "@/pwa/core/lib/utils/audio";
import { CharacterTile } from "../utils/generate-character-tiles";
import { WritingAnswerArea } from "./writing-answer-area";
import { WritingCharacterTiles } from "./writing-character-tiles";
import { Volume2 } from "lucide-react";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { ExerciseTimer } from "@/pwa/core/components/exercise-timer";

export interface WritingQuestionCardProps {
  question: VocabularyQuestion;
  selectedCharacters: string[];
  availableTiles: CharacterTile[];
  onTileSelect: (tileId: string) => void;
  onCharacterDeselect: (index: number) => void;
  inputMode: "hiragana" | "kanji";
  onInputModeChange: (mode: "hiragana" | "kanji") => void;
  isAnswered: boolean;
  isCorrect?: boolean;
  expectedAnswer?: string;
  timerDuration?: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
  questionIndex?: number;
}

export const WritingQuestionCard: React.FC<WritingQuestionCardProps> = ({
  question,
  selectedCharacters,
  availableTiles,
  onTileSelect,
  onCharacterDeselect,
  inputMode,
  onInputModeChange,
  isAnswered,
  isCorrect,
  expectedAnswer,
  timerDuration = 0,
  onTimeUp,
  isPaused = false,
  questionIndex = 0,
}) => {
  const { language } = useLanguage();

  const handlePlayAudio = () => {
    const audioText = question.word?.hiragana || question.japanese;
    if (audioText) {
      playAudio(audioText);
    }
  };

  // Get meaning based on selected language
  const meaning =
    language === "id" ? question.word.meanings.id : question.word.meanings.en;

  return (
    <div className="space-y-6">
      {/* Timer above question */}
      {timerDuration > 0 && onTimeUp && (
        <div className="flex justify-center">
          <ExerciseTimer
            duration={timerDuration}
            onTimeUp={onTimeUp}
            isPaused={isPaused}
            key={questionIndex}
          />
        </div>
      )}

      {/* Question Display */}
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="text-lg text-foreground/80 font-medium text-center">
            Write the {inputMode} for:
          </div>

          <div className="flex items-start justify-center gap-3">
            {/* Audio Button */}

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAudio}
              className="h-10 w-10 rounded-md bg-muted hover:bg-muted/80 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground dark:text-gray-200 border border-border dark:border-gray-700 transition-colors shadow-sm"
            >
              <Volume2 className="h-5 w-5" />
            </Button>

            <div className="text-2xl font-bold text-foreground">{meaning}</div>
          </div>
        </div>

        {/* Answer Area */}
        <WritingAnswerArea
          selectedCharacters={selectedCharacters}
          onCharacterTap={onCharacterDeselect}
          isAnswered={isAnswered}
        />

        {/* Character Tiles */}
        <WritingCharacterTiles
          tiles={availableTiles}
          onTileTap={onTileSelect}
          isAnswered={isAnswered}
        />

        {/* Feedback Messages */}
        {isAnswered && !isCorrect && expectedAnswer && (
          <div className="text-center space-y-2 pt-4 border-t border-border">
            <div className="text-sm text-red-600 dark:text-red-400">
              Your answer:{" "}
              <span className="font-medium">{selectedCharacters.join("")}</span>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Correct answer:{" "}
              <span className="font-medium">{expectedAnswer}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Input Mode Toggle - Bottom sheet style */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Input Mode
          </span>
          <div className="flex rounded-lg border border-border bg-muted/20 p-1">
            <Button
              onClick={() => onInputModeChange("hiragana")}
              variant={inputMode === "hiragana" ? "default" : "ghost"}
              size="sm"
              disabled={isAnswered}
              className="text-sm"
            >
              ひらがな
            </Button>
            <Button
              onClick={() => onInputModeChange("kanji")}
              variant={inputMode === "kanji" ? "default" : "ghost"}
              size="sm"
              disabled={isAnswered}
              className="text-sm"
            >
              漢字
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
