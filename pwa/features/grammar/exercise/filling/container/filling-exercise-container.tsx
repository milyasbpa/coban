"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { GrammarService } from "@/pwa/core/services/grammar";
import { useGrammarScoreStore } from "@/pwa/features/score/store/grammar-score.store";
import { FillingQuestion } from "../types/filling.types";
import { Header } from "../fragments/header";
import { ProgressBar } from "../fragments/progress-bar";
import { QuestionCard } from "../fragments/question-card";
import { OptionsGrid } from "../fragments/options-grid";
import { ActionButtons } from "../fragments/action-buttons";
import { ResultModal } from "../fragments/result-modal";

// Common particles and words for options
const COMMON_PARTICLES = ["は", "が", "を", "に", "で", "へ", "と", "も", "から", "まで", "の"];
const COMMON_COPULAS = ["です", "ます", "だ", "でした", "ありません", "ではありません"];

export function FillingExerciseContainer() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";
  
  // Grammar Score Store
  const { markExampleComplete, initializeUser, isInitialized } = useGrammarScoreStore();
  
  const [questions, setQuestions] = useState<FillingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Initialize user on mount
  useEffect(() => {
    if (!isInitialized) {
      // Generate or get user ID (you can replace with actual auth user ID)
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

    // Generate questions from examples
    const generatedQuestions: FillingQuestion[] = pattern.examples.map((example, idx) => {
      // Analyze sentence to find best blank position (particle or key word)
      const words = example.japanese.split(/\s+/);
      let blankIndex = -1;
      let correctAnswer = "";

      // Priority: Find particles first
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (COMMON_PARTICLES.includes(word)) {
          blankIndex = i;
          correctAnswer = word;
          break;
        }
      }

      // If no particle found, find copula
      if (blankIndex === -1) {
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          if (COMMON_COPULAS.some(copula => word.includes(copula))) {
            blankIndex = i;
            correctAnswer = word;
            break;
          }
        }
      }

      // Fallback: use middle word
      if (blankIndex === -1) {
        blankIndex = Math.floor(words.length / 2);
        correctAnswer = words[blankIndex];
      }

      // Generate wrong options
      const wrongOptions: string[] = [];
      
      // Add similar particles/words
      if (COMMON_PARTICLES.includes(correctAnswer)) {
        const otherParticles = COMMON_PARTICLES.filter(p => p !== correctAnswer);
        wrongOptions.push(...otherParticles.slice(0, 3));
      } else if (COMMON_COPULAS.some(c => correctAnswer.includes(c))) {
        const otherCopulas = COMMON_COPULAS.filter(c => !correctAnswer.includes(c));
        wrongOptions.push(...otherCopulas.slice(0, 3));
      } else {
        // Generic wrong options
        wrongOptions.push(...COMMON_PARTICLES.slice(0, 3));
      }

      // Shuffle options
      const options = [correctAnswer, ...wrongOptions.slice(0, 3)]
        .sort(() => Math.random() - 0.5);

      return {
        id: example.id,
        patternId: pattern.id,
        example,
        blankIndex,
        correctAnswer,
        options,
        sentenceParts: words,
      };
    });

    setQuestions(generatedQuestions);
  };

  const handleSelectAnswer = (answer: string) => {
    if (!isChecked) {
      setSelectedAnswer(answer);
    }
  };

  const handleCheck = () => {
    if (!selectedAnswer || !patternId) return;

    const currentQuestion = questions[currentIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 100);
      setCorrectCount(prev => prev + 1);
      
      // Mark example as complete in score store
      markExampleComplete(patternId, currentQuestion.example.id, level);
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
          selectedAnswer={selectedAnswer}
          isChecked={isChecked}
          isCorrect={isCorrect}
        />

        <OptionsGrid
          options={currentQuestion.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentQuestion.correctAnswer}
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
