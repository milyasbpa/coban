"use client";

import { ChevronLeft, Edit3 } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";
import { LanguageToggleButton } from "@/pwa/core/components/language-toggle-button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function PairingHeader() {
  const searchParams = useSearchParams();

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
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex items-center justify-between p-4">
        {/* Back Button */}
        <Link href={getBackUrl()} passHref>
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
          {/* Language Toggle */}
          <LanguageToggleButton />

          {/* Theme Toggle */}
          <ThemeToggleButton />
        </div>
      </div>
    </div>
  );
}
