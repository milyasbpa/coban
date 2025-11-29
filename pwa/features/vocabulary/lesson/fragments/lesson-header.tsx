"use client";

import { ArrowLeft, Edit3 } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";
import { LanguageToggleButton } from "@/pwa/core/components/language-toggle-button";
import { useVocabularySelection } from "../store/vocabulary-selection.store";
import Link from "next/link";

export function LessonHeader() {
  const { isSelectionMode, toggleSelectionMode } = useVocabularySelection();

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex items-center justify-between p-4">
        {/* Back Button */}
        <Link href="/" passHref className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-semibold text-foreground">
            Back
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
        </div>
      </div>
    </div>
  );
}
