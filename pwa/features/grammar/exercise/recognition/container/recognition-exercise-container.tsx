"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { GrammarService } from "@/pwa/core/services/grammar";
import { useGrammarScoreStore } from "@/pwa/features/score/store/grammar-score.store";
import { RecognitionQuestion, RecognitionOption } from "../types/recognition.types";
import { Header } from "../fragments/header";
import { ProgressBar } from "../fragments/progress-bar";
import { QuestionCard } from "../fragments/question-card";
import { OptionsGrid } from "../fragments/options-grid";
import { ActionButtons } from "../fragments/action-buttons";
import { ResultModal } from "../fragments/result-modal";

export function RecognitionExerciseContainer() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";
  
  const { markExampleComplete, initializeUser, isInitialized } = useGrammarScoreStore();
  
  const [questions, setQuestions] = useState<RecognitionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const userId = typeof window !== "undefined" 
        ? localStorage.getItem("userId") || `user_${Date.now()}`
        : `user_${Date.now()}`;
      
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", userId);
      }
      
      initializeUser(userId, level);
    }
  }, [isInitialized, level, initializeUser]);

  useEffect(() => {
    generateQuestions();
  }, [patternId, level]);

  const generateQuestions = () => {
    const allPatterns = GrammarService.getAllPatternsByLevel(level);
    
    if (allPatterns.length === 0) {
      console.error("No patterns found");
      return;
    }

    // Get target pattern if specified
    const targetPattern = patternId
      ? allPatterns.find(p => p.id === parseInt(patternId))
      : null;

    // If pattern specified, use its examples; otherwise use all patterns
    const patternsToUse = targetPattern ? [targetPattern] : allPatterns;

    const generatedQuestions: RecognitionQuestion[] = [];

    patternsToUse.forEach(pattern => {
      pattern.examples.forEach(example => {
        // Get other patterns as wrong options
        const otherPatterns = allPatterns.filter(p => p.id !== pattern.id);
        const wrongOptions = otherPatterns
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(p => ({
            patternId: p.id,
            patternName: p.japanese,
            japanese: p.japanese,
            description: p.meanings.en,
          }));

        // Add correct option
        const correctOption: RecognitionOption = {
          patternId: pattern.id,
          patternName: pattern.japanese,
          japanese: pattern.japanese,
          description: pattern.meanings.en,
        };

        // Shuffle options
        const options = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5);

        generatedQuestions.push({
          id: example.id,
          example,
          correctPatternId: pattern.id,
          options,
        });
      });
    });

    // Shuffle questions
    setQuestions(generatedQuestions.sort(() => Math.random() - 0.5));
  };

  const handleSelectAnswer = (patternId: number) => {
    if (!isChecked) {
      setSelectedAnswer(patternId);
    }
  };

  const handleCheck = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentIndex];
    const correct = selectedAnswer === currentQuestion.correctPatternId;
    
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 100);
      setCorrectCount(prev => prev + 1);
      
      // Mark example as complete
      if (patternId) {
        markExampleComplete(patternId, currentQuestion.example.id, level);
      }
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsChecked(false);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setIsCorrect(null);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setShowResult(false);
    generateQuestions();
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header
        score={score}
        correctCount={correctCount}
        wrongCount={wrongCount}
      />

      <div className="px-4 py-4 space-y-4">
        <ProgressBar
          current={currentIndex + 1}
          total={questions.length}
          progress={progress}
        />

        <QuestionCard
          question={currentQuestion}
          isChecked={isChecked}
          isCorrect={isCorrect}
        />

        <OptionsGrid
          options={currentQuestion.options}
          selectedAnswer={selectedAnswer}
          correctPatternId={currentQuestion.correctPatternId}
          isChecked={isChecked}
          onSelectAnswer={handleSelectAnswer}
        />

        <ActionButtons
          selectedAnswer={selectedAnswer}
          isChecked={isChecked}
          isCorrect={isCorrect}
          isLastQuestion={currentIndex === questions.length - 1}
          onCheck={handleCheck}
          onNext={handleNext}
        />
      </div>

      <ResultModal
        isOpen={showResult}
        score={score}
        correctCount={correctCount}
        wrongCount={wrongCount}
        totalQuestions={questions.length}
        onRestart={handleRestart}
        onClose={() => setShowResult(false)}
      />
    </div>
  );
}
