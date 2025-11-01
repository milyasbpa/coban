"use client";

import { Sun, Moon, X } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { Progress } from "@/pwa/core/components/progress";
import { useTheme } from "@/pwa/core/lib/hooks/use-theme";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import ReactCountryFlag from "react-country-flag";
import Link from "next/link";
import { useReadingExerciseStore } from "../store";

export function ReadingHeader() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isIndonesian, toggleLanguage } = useLanguage();
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
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 p-0 hover:bg-accent/20 transition-colors"
            onClick={toggleLanguage}
            aria-label={`Switch to ${isIndonesian ? "English" : "Indonesian"}`}
          >
            <div className="border border-border rounded-sm overflow-hidden">
              <ReactCountryFlag
                countryCode={isIndonesian ? "ID" : "US"}
                svg
                style={{
                  width: "20px",
                  height: "15px",
                  display: "block",
                }}
              />
            </div>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 p-0 hover:bg-accent/20 transition-colors"
            onClick={() => toggleTheme()}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
