"use client";

import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { SettingsDropdown } from "@/pwa/core/components/settings-dropdown";
import { UserDropdown } from "@/pwa/features/home/components/user-dropdown";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useVocabularyDisplayOptions } from "../store/display-options.store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useSearchParams, useRouter } from "next/navigation";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { titleCase } from "@/pwa/core/lib/utils/titleCase";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";
import Link from "next/link";

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

  // Prepare display options for settings dropdown
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

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back Button & Title */}
        <Link href="/" passHref className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-sm font-semibold text-foreground">
            {lessonTitle}
          </h1>
        </Link>

        {/* Right side - Settings & User */}
        <div className="flex items-center gap-2">
          {/* Settings Dropdown */}
          <SettingsDropdown
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={toggleSelectionMode}
            displayOptions={settingsDisplayOptions}
            onResetDisplayOptions={resetToDefault}
            showDisplayOptions={true}
          />

          {/* User Dropdown or Login Button */}
          {isAuthenticated ? (
            <UserDropdown user={user} onLogout={handleLogout} />
          ) : (
            <button
              onClick={handleLogin}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Login"
            >
              <User className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
