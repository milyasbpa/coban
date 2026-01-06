"use client";

import { Progress } from '@/pwa/core/components/progress';
import { ArrowLeft } from 'lucide-react';
import { AppHeader } from '@/pwa/core/components/app-header';
import { useWritingExerciseStore } from '../store/writing-exercise.store';
import { useLoginStore } from '@/pwa/features/login/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearLastVisitedPage } from '@/pwa/core/lib/hooks/use-last-visited-page';
import { signOut } from 'firebase/auth';
import { auth } from '@/pwa/core/config/firebase';

export function WritingHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { gameState, questionState } = useWritingExerciseStore();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const currentQuestionIndex = questionState.currentQuestionIndex;
  const questions = gameState.questions;
  const score = gameState.score;
  
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  // Get URL parameters for back navigation logic
  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level");
  const selectedKanji = searchParams.get("selectedKanji");

  // Determine back URL based on route context
  const getBackUrl = () => {
    // If coming from exercise with selectedKanji, go back to lesson
    if (selectedKanji && lessonId && level) {
      return `/kanji/lesson?lessonId=${lessonId}&level=${level}`;
    }

    // Default back to home
    return "/";
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      storeLogout();
      clearLastVisitedPage();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };
  
  return (
    <div className="space-y-2">
      <AppHeader
        leftSide={{
          type: "back",
          href: getBackUrl(),
          icon: ArrowLeft,
        }}
        title="Kanji Writing"
        showSettings={true}
        settingsConfig={{
          showTheme: true,
          showLanguage: true,
        }}
        showUser={true}
        userConfig={{
          isAuthenticated,
          user,
          onLogout: handleLogout,
          onLogin: handleLogin,
        }}
      />
      <div className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-muted-foreground">
            Score: {score}/{totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}