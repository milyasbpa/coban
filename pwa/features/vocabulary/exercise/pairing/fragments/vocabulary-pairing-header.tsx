"use client";

import { ArrowLeft, Eye, Volume2 } from "lucide-react";
import { AppHeader } from "@/pwa/core/components/app-header";
import { useVocabularyPairingDisplayOptions } from "../store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useRouter, useSearchParams } from "next/navigation";
import { clearLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";

export function VocabularyPairingHeader() {
  const {
    displayHiragana,
    displayRomaji,
    displayKanji,
    displaySound,
    toggleHiragana,
    toggleRomaji,
    toggleKanji,
    toggleSound,
    resetToDefault,
  } = useVocabularyPairingDisplayOptions();
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
      clearLastVisitedPage(); // Clear saved page on logout
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

  // Prepare sound option
  const soundOption = [
    {
      key: "sound",
      label: "Sound",
      description: "Play audio on card click",
      isActive: displaySound,
      toggle: toggleSound,
    },
  ];

  // Prepare custom sections for settings dropdown
  const customSections = [
    {
      id: "sound",
      title: "Audio",
      icon: <Volume2 className="h-3 w-3" />,
      items: soundOption.map((option) => ({
        id: option.key,
        type: "switch" as const,
        label: option.label,
        description: option.description,
        isActive: option.isActive,
        onClick: option.toggle,
      })),
    },
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
      title="Vocabulary Pairing"
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
