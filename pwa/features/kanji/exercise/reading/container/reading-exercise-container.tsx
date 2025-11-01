"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, X } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { Progress } from "@/pwa/core/components/progress";
import { KanjiDisplay } from "../components/kanji-display";
import { AnswerInput } from "../components/answer-input";
import { ModeSelector } from "../fragments/mode-selector";
import { AnswerBottomSheet } from "../fragments/answer-bottomsheet";
import { GameResult } from "../../pairing/fragments/game-result";
import { 
  getReadingGameData, 
  checkAnswer, 
  calculateReadingScore
} from "../utils/reading-game";
import { useReadingExerciseStore } from "../store";

export function ReadingExerciseContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const lessonId = searchParams.get('lessonId');
  const level = searchParams.get('level') || 'N5';
  
  // Use store
  const {
    inputMode,
    selectedOption,
    directInput,
    isAnswered,
    showBottomSheet,
    currentResult,
    gameStats,
    isGameComplete,
    getCurrentQuestion,
    getProgress,
    getCanCheck,
    initializeGame,
    setInputMode,
    setSelectedOption,
    setDirectInput,
    setIsAnswered,
    setShowBottomSheet,
    setCurrentResult,
    updateGameStats,
    handleNextQuestion,
    restartGame
  } = useReadingExerciseStore();

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const canCheck = getCanCheck();

  // Initialize game
  useEffect(() => {
    if (lessonId) {
      const gameData = getReadingGameData(parseInt(lessonId), level);
      initializeGame(gameData.questions, gameData.totalQuestions);
    }
  }, [lessonId, level, initializeGame]);

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    
    const userAnswer = inputMode === "multiple-choice" ? selectedOption : directInput;
    
    if (!userAnswer.trim()) return; // No answer provided
    
    const result = checkAnswer(currentQuestion, userAnswer);
    setCurrentResult(result);
    setIsAnswered(true);
    setShowBottomSheet(true);
    
    // Update stats
    updateGameStats({
      correctAnswers: gameStats.correctAnswers + (result.isCorrect ? 1 : 0),
      wrongAnswers: gameStats.wrongAnswers + (result.isCorrect ? 0 : 1)
    });
  };

  const onNextQuestion = () => {
    handleNextQuestion(calculateReadingScore);
  };

  const handleRestart = () => {
    restartGame();
  };

  const handleBackToHome = () => {
    router.back();
  };

  // if (isGameComplete) {
  //   return (
  //     <GameResult 
  //       stats={{
  //         totalWords: gameStats.totalQuestions,
  //         correctPairs: gameStats.correctAnswers,
  //         wrongAttempts: gameStats.wrongAnswers,
  //         currentSection: 1,
  //         totalSections: 1,
  //         score: gameStats.score
  //       }}
  //       onRestart={handleRestart}
  //       onBackToHome={handleBackToHome}
  //     />
  //   );
  // }

  if (!currentQuestion) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={handleBackToHome}>
          <X className="h-4 w-4 text-red-500" />
        </Button>
        
        <div className="flex-1 mx-4">
          <Progress value={progress} className="h-2" />
        </div>
        
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Question Title */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-foreground mb-4">
            Choose the correct reading
          </h1>
          
          {/* Kanji Display */}
          <KanjiDisplay kanji={currentQuestion.kanji} />
        </div>

        {/* Mode Selector */}
        <ModeSelector />

        {/* Answer Input */}
        <div className="mb-8">
          <AnswerInput
            mode={inputMode}
            options={currentQuestion.options}
            selectedOption={selectedOption}
            directInput={directInput}
            onOptionSelect={setSelectedOption}
            onInputChange={setDirectInput}
            disabled={isAnswered}
          />
        </div>

        {/* Check Button */}
        <Button
          onClick={handleCheckAnswer}
          disabled={!canCheck || isAnswered}
          className="w-full h-16 text-lg bg-muted hover:bg-muted/80 text-foreground"
        >
          CHECK
        </Button>
      </div>

      {/* Answer Bottom Sheet */}
      <AnswerBottomSheet />
    </div>
  );
}