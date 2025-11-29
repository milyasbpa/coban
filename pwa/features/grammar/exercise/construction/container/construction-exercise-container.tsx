"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { GrammarService } from "@/pwa/core/services/grammar";
import { useGrammarScoreStore } from "@/pwa/features/score/store/grammar-score.store";
import { ConstructionQuestion, WordTile } from "../types/construction.types";
import { Header } from "../fragments/header";
import { ProgressBar } from "../fragments/progress-bar";
import { QuestionCard } from "../fragments/question-card";
import { WordBank } from "../fragments/word-bank";
import { AnswerArea } from "../fragments/answer-area";
import { ActionButtons } from "../fragments/action-buttons";
import { ResultModal } from "../fragments/result-modal";

export function ConstructionExerciseContainer() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";
  
  const { markExampleComplete, initializeUser, isInitialized } = useGrammarScoreStore();
  
  const [questions, setQuestions] = useState<ConstructionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
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
    const pattern = patternId
      ? GrammarService.getPatternById(parseInt(patternId), level)
      : null;

    if (!pattern || !pattern.examples || pattern.examples.length === 0) {
      console.error("No pattern or examples found");
      return;
    }

    const generatedQuestions: ConstructionQuestion[] = pattern.examples.map((example) => {
      // Split sentence into words
      const words = example.japanese.split(/\s+/).filter(w => w.length > 0);
      
      // Create shuffled tiles
      const tiles: WordTile[] = words.map((word, index) => ({
        id: `word-${index}-${Math.random()}`,
        word,
        originalIndex: index,
      }));

      // Shuffle tiles
      const shuffled = [...tiles].sort(() => Math.random() - 0.5);

      return {
        id: example.id,
        patternId: pattern.id,
        example,
        correctOrder: words,
        shuffledWords: shuffled,
      };
    });

    setQuestions(generatedQuestions);
  };

  const handleAddWord = (word: string) => {
    if (!isChecked) {
      setUserAnswer(prev => [...prev, word]);
    }
  };

  const handleRemoveWord = (index: number) => {
    if (!isChecked) {
      setUserAnswer(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleClear = () => {
    if (!isChecked) {
      setUserAnswer([]);
    }
  };

  const handleCheck = () => {
    if (userAnswer.length === 0 || !patternId) return;

    const currentQuestion = questions[currentIndex];
    const correct = JSON.stringify(userAnswer) === JSON.stringify(currentQuestion.correctOrder);
    
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 150); // Higher score for construction
      setCorrectCount(prev => prev + 1);
      markExampleComplete(patternId, currentQuestion.example.id, level);
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer([]);
      setIsChecked(false);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer([]);
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

        <AnswerArea
          userAnswer={userAnswer}
          correctOrder={currentQuestion.correctOrder}
          isChecked={isChecked}
          isCorrect={isCorrect}
          onRemoveWord={handleRemoveWord}
          onClear={handleClear}
        />

        <WordBank
          words={currentQuestion.shuffledWords}
          usedWords={userAnswer}
          isChecked={isChecked}
          onAddWord={handleAddWord}
        />

        <ActionButtons
          hasAnswer={userAnswer.length > 0}
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
