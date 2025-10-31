"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Settings, X } from "lucide-react";
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
  calculateReadingScore,
  ReadingQuestion,
  ReadingGameStats,
  AnswerResult
} from "../utils/reading-game";

export function ReadingExerciseContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const lessonId = searchParams.get('lessonId');
  const level = searchParams.get('level') || 'N5';
  
  // Game state
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputMode, setInputMode] = useState<"multiple-choice" | "direct-input">("multiple-choice");
  const [selectedOption, setSelectedOption] = useState("");
  const [directInput, setDirectInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnswerResult | null>(null);
  const [gameStats, setGameStats] = useState<ReadingGameStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentQuestion: 1,
    score: 0
  });
  const [isGameComplete, setIsGameComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

  // Initialize game
  useEffect(() => {
    if (lessonId) {
      const gameData = getReadingGameData(parseInt(lessonId), level);
      setQuestions(gameData.questions);
      setGameStats(prev => ({
        ...prev,
        totalQuestions: gameData.totalQuestions
      }));
    }
  }, [lessonId, level]);

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    
    const userAnswer = inputMode === "multiple-choice" ? selectedOption : directInput;
    
    if (!userAnswer.trim()) return; // No answer provided
    
    const result = checkAnswer(currentQuestion, userAnswer);
    setCurrentResult(result);
    setIsAnswered(true);
    setShowBottomSheet(true);
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (result.isCorrect ? 1 : 0),
      wrongAnswers: prev.wrongAnswers + (result.isCorrect ? 0 : 1)
    }));
  };

  const handleNextQuestion = () => {
    setShowBottomSheet(false);
    setCurrentResult(null);
    setIsAnswered(false);
    setSelectedOption("");
    setDirectInput("");
    
    if (currentQuestionIndex + 1 < questions.length) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setGameStats(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    } else {
      // Game complete
      const finalScore = calculateReadingScore({
        ...gameStats,
        correctAnswers: gameStats.correctAnswers + (currentResult?.isCorrect ? 1 : 0),
        wrongAnswers: gameStats.wrongAnswers + (currentResult?.isCorrect ? 0 : 1)
      });
      
      setGameStats(prev => ({ ...prev, score: finalScore }));
      setIsGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setIsAnswered(false);
    setShowBottomSheet(false);
    setCurrentResult(null);
    setSelectedOption("");
    setDirectInput("");
    setIsGameComplete(false);
    setGameStats({
      totalQuestions: questions.length,
      correctAnswers: 0,
      wrongAnswers: 0,
      currentQuestion: 1,
      score: 0
    });
  };

  const handleBackToHome = () => {
    router.back();
  };

  const canCheck = inputMode === "multiple-choice" 
    ? selectedOption.trim() !== "" 
    : directInput.trim() !== "";

  if (isGameComplete) {
    return (
      <GameResult 
        stats={{
          totalWords: gameStats.totalQuestions,
          correctPairs: gameStats.correctAnswers,
          wrongAttempts: gameStats.wrongAnswers,
          currentSection: 1,
          totalSections: 1,
          score: gameStats.score
        }}
        onRestart={handleRestart}
        onBackToHome={handleBackToHome}
      />
    );
  }

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
        <ModeSelector
          currentMode={inputMode}
          onModeChange={setInputMode}
          disabled={isAnswered}
        />

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
      <AnswerBottomSheet
        isOpen={showBottomSheet}
        result={currentResult}
        onNext={handleNextQuestion}
      />
    </div>
  );
}