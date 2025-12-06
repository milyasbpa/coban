"use client";

import { ArrowLeft, Eye } from "lucide-react";
import { AppHeader } from "@/pwa/core/components/app-header";
import { useVocabularyReadingDisplayOptions } from "../store/vocabulary-reading-display-options.store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useRouter, useSearchParams } from "next/navigation";
import { clearLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";

export function VocabularyReadingHeader() {
  const {
    displayHiragana,
    displayRomaji,
    displayKanji,
    toggleHiragana,
    toggleRomaji,
    toggleKanji,
    resetToDefault,
  } = useVocabularyReadingDisplayOptions();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level");
  const selectedVocabularyParam = searchParams.get("selectedVocabulary");
  
  const getBackUrl = () => {
    if (selectedVocabularyParam && categoryId && level) {
      return `/vocabulary/lesson?categoryId=${categoryId}&level=${level}`;
    }
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
      key: "kanji",
      label: "Kanji",
      description: "Japanese characters",
      isActive: displayKanji,
      toggle: toggleKanji,
    },
    {
      key: "hiragana",
      label: "Hiragana",
      description: "Reading guide",
      isActive: displayHiragana,
      toggle: toggleHiragana,
    },
    {
      key: "romaji",
      label: "Romaji",
      description: "Latin script",
      isActive: displayRomaji,
      toggle: toggleRomaji,
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
    <AppHeader
      leftSide={{
        type: "back",
        href: getBackUrl(),
        icon: ArrowLeft,
      }}
      title="Vocabulary Reading"
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
  );
}