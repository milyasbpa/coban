"use client";

import { ArrowLeft, Eye } from "lucide-react";
import { AppHeader } from "@/pwa/core/components/app-header";
import { useVocabularyPairingDisplayOptions } from "../store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useRouter } from "next/navigation";
import { clearLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";

export function VocabularyPairingHeader() {
  const {
    displayHiragana,
    displayRomaji,
    displayKanji,
    toggleHiragana,
    toggleRomaji,
    toggleKanji,
    resetToDefault,
  } = useVocabularyPairingDisplayOptions();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const router = useRouter();

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
        href: "/",
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
