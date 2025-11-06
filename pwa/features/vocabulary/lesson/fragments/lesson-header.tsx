"use client";

import { ChevronLeft, Edit3 } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";
import { LanguageToggleButton } from "@/pwa/core/components/language-toggle-button";
import Link from "next/link";

export function LessonHeader() {
  // Note: Selection mode for vocabulary can be added later if needed
  // const { isSelectionMode, toggleSelectionMode } = useVocabularySelection();

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex items-center justify-between p-4">
        {/* Back Button */}
        <Link href="/" passHref>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </Link>
        
        {/* Right side - Language and Theme toggles */}
        <div className="flex items-center gap-3">
          {/* Selection Mode Toggle - Placeholder for future */}
          {/* <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-8 w-8 p-0 transition-colors ${
              isSelectionMode 
                ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                : 'hover:bg-accent/20'
            }`}
            onClick={toggleSelectionMode}
            aria-label="Toggle selection mode"
          >
            <Edit3 className="w-4 h-4" />
          </Button> */}

          {/* Language Toggle */}
          <LanguageToggleButton />

          {/* Theme Toggle */}
          <ThemeToggleButton />
        </div>
      </div>
    </div>
  );
}