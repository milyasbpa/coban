"use client";

import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { useVocabularyReadingDisplayOptions } from "../store/vocabulary-reading-display-options.store";
import { Button } from "@/pwa/core/components/button";
import { Volume2 } from "lucide-react";
import { playAudio } from "@/pwa/core/lib/utils/audio";

export function VocabularyReadingQuestion() {
  const { getCurrentQuestion, getCurrentQuestionNumber, getTotalQuestions } =
    useVocabularyReadingExerciseStore();

  const { displayHiragana, displayRomaji, displayKanji } =
    useVocabularyReadingDisplayOptions();

  const currentQuestion = getCurrentQuestion();
  const currentQuestionNumber = getCurrentQuestionNumber();
  const totalQuestions = getTotalQuestions();

  if (!currentQuestion) return null;

  const handlePlayAudio = () => {
    const audioText =
      currentQuestion.word?.hiragana || currentQuestion.japanese;
    if (audioText) {
      playAudio(audioText);
    }
  };

  const getQuestionDisplay = () => {
    // Show content based on display options
    if (displayKanji && currentQuestion.word?.kanji) {
      return currentQuestion.word.kanji;
    } else if (currentQuestion.word?.hiragana) {
      return currentQuestion.word.hiragana;
    } else {
      return currentQuestion.japanese; // Fallback to japanese field
    }
  };

  const getQuestionSubtext = () => {
    const subtexts: string[] = [];

    // Add hiragana if enabled and kanji is displayed
    if (
      displayHiragana &&
      displayKanji &&
      currentQuestion.word?.kanji &&
      currentQuestion.word?.hiragana
    ) {
      subtexts.push(currentQuestion.word.hiragana);
    }

    // Add romaji if enabled
    if (displayRomaji && currentQuestion.word?.romaji) {
      subtexts.push(currentQuestion.word.romaji);
    }

    return subtexts.length > 0 ? subtexts.join(" • ") : null;
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Progress indicator */}
      <div className="text-sm text-muted-foreground text-center">
        Question {currentQuestionNumber} of {totalQuestions}
      </div>

      {/* Question Content */}
      <div className="text-center space-y-2">
        <h2 className="text-lg font-medium text-muted-foreground">
          What does this mean?
        </h2>
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
          <div>
            <div className="text-4xl font-bold text-foreground">
              {getQuestionDisplay()}
            </div>
            {getQuestionSubtext() && (
              <div className="text-xl text-muted-foreground">
                {getQuestionSubtext()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
