"use client";

import { X } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { Progress } from "@/pwa/core/components/progress";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";
import { LanguageToggleButton } from "@/pwa/core/components/language-toggle-button";
import Link from "next/link";
import { useReadingExerciseStore } from "../store";

export function ReadingHeader() {
  // Use store
  const { getProgress } = useReadingExerciseStore();
  const progress = getProgress();

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex items-center justify-between p-4">
        <Link href="/" passHref>
          <Button variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex-1 mx-4">
          <Progress value={progress} className="h-2" />
        </div>

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
