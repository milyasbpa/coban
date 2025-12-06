"use client";

import { Progress } from '@/pwa/core/components/progress';
import { ArrowLeft } from 'lucide-react';
import { AppHeader } from '@/pwa/core/components/app-header';
import { useVocabularyWritingExerciseStore } from '../store/vocabulary-writing-exercise.store';
import { useLoginStore } from '@/pwa/features/login/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearLastVisitedPage } from '@/pwa/core/lib/hooks/use-last-visited-page';
import { signOut } from 'firebase/auth';
import { auth } from '@/pwa/core/config/firebase';

export function VocabularyWritingHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { gameState, questionState, getCurrentQuestionNumber, getTotalQuestions } = useVocabularyWritingExerciseStore();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const currentQuestionIndex = getCurrentQuestionNumber();
  const totalQuestions = getTotalQuestions();
  const score = gameState.score;
  
  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level");
  const selectedVocabularyParam = searchParams.get("selectedVocabulary");
  
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;
  
  const getBackUrl = () => {
    if (selectedVocabularyParam && categoryId && level) {
      return `/vocabulary/lesson?categoryId=${categoryId}&level=${level}`;
    }
    return "/";
  };
  
  const handleBack = () => {
    router.push(getBackUrl());
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
          onClick: handleBack,
        }}
        title="Vocabulary Writing"
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
            Question {currentQuestionIndex} of {totalQuestions}
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
