"use client";

import { ArrowLeft, Edit3, User } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";
import { LanguageToggleButton } from "@/pwa/core/components/language-toggle-button";
import { UserDropdown } from "@/pwa/features/home/components/user-dropdown";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import { useLoginStore } from "@/pwa/features/login/store";
import { useSearchParams, useRouter } from "next/navigation";
import { VocabularyService } from "@/pwa/core/services/vocabulary";
import { titleCase } from "@/pwa/core/lib/utils/titleCase";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";
import Link from "next/link";

export function LessonHeader() {
  const { isSelectionMode, toggleSelectionMode } = useVocabularySelection();
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

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex items-center justify-between p-4">
        {/* Back Button */}
        <Link href="/" passHref className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-semibold text-foreground">
            {lessonTitle}
          </h1>
        </Link>

        {/* Right side - Selection Mode, Language and Theme toggles */}
        <div className="flex items-center gap-3">
          {/* Selection Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-8 w-8 p-0 transition-colors ${
              isSelectionMode
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "hover:bg-accent/20"
            }`}
            onClick={toggleSelectionMode}
            aria-label="Toggle selection mode"
          >
            <Edit3 className="w-4 h-4" />
          </Button>

          {/* Language Toggle */}
          <LanguageToggleButton />

          {/* Theme Toggle */}
          <ThemeToggleButton />

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
