"use client";

import { X, Eye } from "lucide-react";
import { AppHeader } from "@/pwa/core/components/app-header";
import { Progress } from "@/pwa/core/components/progress";
import { useReadingDisplayOptions } from "../store/reading-display-options.store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useRouter, useSearchParams } from "next/navigation";
import { clearLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";
import { useReadingExerciseStore } from "../store";

export function ReadingHeader() {
  const { displayRomanji, toggleRomanji, resetToDefault } = useReadingDisplayOptions();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const { getProgress } = useReadingExerciseStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const progress = getProgress();

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

  // Prepare display options
  const settingsDisplayOptions = [
    {
      key: "romanji",
      label: "Romanji",
      description: "Latin script",
      isActive: displayRomanji,
      toggle: toggleRomanji,
    },
  ];

  // Prepare custom sections for settings dropdown
  const customSections = [
    {
      id: "display",
      title: "Display Options",
      icon: <Eye className="h-3 w-3" />,
      showReset: true,
      onReset: resetToDefault,
      items: settingsDisplayOptions.map((option) => ({
        id: option.key,
        type: "switch" as const,
        label: option.label,
        description: option.description,
        isActive: option.isActive,
        onClick: option.toggle,
      })),
    },
  ];

  return (
    <div className="space-y-2">
      <AppHeader
        leftSide={{
          type: "back",
          href: getBackUrl(),
          icon: X,
        }}
        title="Kanji Reading"
        showSettings={true}
        settingsConfig={{
          showTheme: true,
          showLanguage: true,
          customSections,
        }}
        showUser={true}
        userConfig={{
          isAuthenticated,
          user,
          onLogout: handleLogout,
          onLogin: handleLogin,
        }}
      />
      <div className="px-4">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
