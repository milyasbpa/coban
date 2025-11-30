"use client";

import { ArrowLeft, Eye } from "lucide-react";
import { AppHeader } from "@/pwa/core/components/app-header";
import { usePairingDisplayOptions } from "../store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useRouter, useSearchParams } from "next/navigation";
import { clearLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";

export function PairingHeader() {
  const searchParams = useSearchParams();
  const {
    displayFurigana,
    displayRomanji,
    toggleFurigana,
    toggleRomanji,
    resetToDefault,
  } = usePairingDisplayOptions();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const router = useRouter();

  // Get URL parameters for back navigation logic
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level");
  const selectedKanji = searchParams.get("selectedKanji");

  // Determine back URL based on route context
  const getBackUrl = () => {
    // If coming from exercise with selectedKanji, go back to lesson
    if (selectedKanji && topicId && level) {
      return `/kanji/lesson?topicId=${topicId}&level=${level}`;
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
      key: "furigana",
      label: "Furigana",
      description: "Reading guide",
      isActive: displayFurigana,
      toggle: toggleFurigana,
    },
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
    <AppHeader
      leftSide={{
        type: "back",
        href: getBackUrl(),
        icon: ArrowLeft,
      }}
      title="Kanji Pairing"
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
