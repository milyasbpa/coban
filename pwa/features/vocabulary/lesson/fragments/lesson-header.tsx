"use client";

import { ArrowLeft, Edit3, Eye } from "lucide-react";
import { AppHeader } from "@/pwa/core/components/app-header";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useVocabularyDisplayOptions } from "../store/display-options.store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useSearchParams, useRouter } from "next/navigation";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { titleCase } from "@/pwa/core/lib/utils/titleCase";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";

export function LessonHeader() {
  const { isSelectionMode, toggleSelectionMode } = useVocabularySelection();
  const {
    displayOptions,
    toggleHiragana,
    toggleJapanese,
    toggleMeaning,
    toggleRomanji,
    resetToDefault,
  } = useVocabularyDisplayOptions();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";

  // Get category name
  const category = categoryId
    ? VocabularyService.getVocabularyByCategory(parseInt(categoryId), level)
    : null;

  const lessonTitle = category?.category.en
    ? titleCase(category.category.en)
    : "Vocabulary Lesson";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      storeLogout();
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
      key: "hiragana",
      label: "Hiragana",
      description: "Reading pronunciation",
      isActive: displayOptions.hiragana,
      toggle: toggleHiragana,
    },
    {
      key: "japanese",
      label: "JP",
      description: "Japanese kanji",
      isActive: displayOptions.japanese,
      toggle: toggleJapanese,
    },
    {
      key: "meaning",
      label: "EN",
      description: "Meaning",
      isActive: displayOptions.meaning,
      toggle: toggleMeaning,
    },
    {
      key: "romanji",
      label: "Romanji",
      description: "Latin script",
      isActive: displayOptions.romanji,
      toggle: toggleRomanji,
    },
  ];

  // Prepare custom sections for settings dropdown
  const customSections = [
    {
      id: "tools",
      items: [
        {
          id: "selection-mode",
          type: "switch" as const,
          label: "Selection Mode",
          icon: <Edit3 className="h-4 w-4" />,
          isActive: isSelectionMode,
          onClick: toggleSelectionMode,
        },
      ],
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
        href: "/",
        icon: ArrowLeft,
      }}
      title={lessonTitle}
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
