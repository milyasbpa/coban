"use client";

import { Progress } from '@/pwa/core/components/progress';
import { ArrowLeft } from 'lucide-react';
import { AppHeader } from '@/pwa/core/components/app-header';
import { useVocabularyWritingExerciseStore } from '../store/vocabulary-writing-exercise.store';
import { useLoginStore } from '@/pwa/features/login/store';
import { useRouter } from 'next/navigation';
import { clearLastVisitedPage } from '@/pwa/core/lib/hooks/use-last-visited-page';
import { signOut } from 'firebase/auth';
import { auth } from '@/pwa/core/config/firebase';

export function VocabularyWritingHeader() {
  const router = useRouter();
  const { gameState, questionState, getCurrentQuestionNumber, getTotalQuestions } = useVocabularyWritingExerciseStore();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const currentQuestionIndex = getCurrentQuestionNumber();
  const totalQuestions = getTotalQuestions();
  const score = gameState.score;
  
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;
  
  const handleBack = () => {
    router.back();
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
          href: "/",
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
