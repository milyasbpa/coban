"use client";

import { ArrowLeft, Edit3, Eye, Trash2 } from "lucide-react";
import { AppHeader } from "@/pwa/core/components/app-header";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { useDisplayOptions } from "../store/display-options.store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useSearchParams, useRouter } from "next/navigation";
import { KanjiService } from "@/pwa/core/services/kanji";
import { titleCase } from "@/pwa/core/lib/utils/titleCase";
import { clearLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";

export function LessonHeader() {
  const { isSelectionMode, toggleSelectionMode } = useKanjiSelection();
  const {
    displayOptions,
    toggleFurigana,
    toggleJapanese,
    toggleMeaning,
    toggleRomanji,
    resetToDefault,
  } = useDisplayOptions();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();
  const { resetLessonStatistics } = useKanjiScoreStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonId = searchParams.get("lessonId");
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level") || "N5";

  // Get lesson title
  let lessonTitle = "Kanji Lesson";
  if (topicId) {
    const categories = KanjiService.getTopicCategories(level);
    const category = categories[topicId];
    if (category) {
      lessonTitle = titleCase(category.name);
    }
  } else if (lessonId) {
    lessonTitle = `Lesson ${lessonId}`;
  }

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

  const handleResetLessonStatistics = async () => {
    if (!isAuthenticated) return;

    try {
      // Extract kanji IDs based on lesson type
      let kanjiDetails: Array<{ id: number }> = [];
      
      if (topicId) {
        // Topic-based lesson
        kanjiDetails = KanjiService.getKanjiDetailsByTopicId(topicId, level);
      } else if (lessonId) {
        // Stroke-based lesson
        kanjiDetails = KanjiService.getKanjiDetailsByLessonId(
          parseInt(lessonId),
          level
        );
      }

      const kanjiIds = kanjiDetails.map((k) => k.id.toString());
      
      if (kanjiIds.length > 0) {
        await resetLessonStatistics(kanjiIds);
      }
    } catch (error) {
      console.error("Failed to reset lesson statistics:", error);
    }
  };

  // Prepare display options
  const settingsDisplayOptions = [
    {
      key: "furigana",
      label: "Furigana",
      description: "Reading guide",
      isActive: displayOptions.furigana,
      toggle: toggleFurigana,
    },
    {
      key: "japanese",
      label: "JP",
      description: "Japanese text",
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
      id: "actions",
      title: "Actions",
      items: [
        {
          id: "reset-lesson",
          type: "action" as const,
          label: "Reset Lesson Statistics",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: handleResetLessonStatistics,
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