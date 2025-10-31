"use client";

import { ChevronLeft, Sun, Moon, Edit3 } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { useTheme } from "@/pwa/core/lib/hooks/use-theme";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { useKanjiSelection } from "../store/kanji-selection.store";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";

export function LessonHeader() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isIndonesian, toggleLanguage } = useLanguage();
  const { isSelectionMode, toggleSelectionMode } = useKanjiSelection();

  return (
    <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
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
        
        {/* Right side - Selection Mode, Language and Theme toggles */}
        <div className="flex items-center gap-3">
          {/* Selection Mode Toggle */}
          <Button
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
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 p-0 hover:bg-accent/20 transition-colors"
            onClick={toggleLanguage}
            aria-label={`Switch to ${isIndonesian ? 'English' : 'Indonesian'}`}
          >
            <div className="border border-border rounded-sm overflow-hidden">
              <ReactCountryFlag
                countryCode={isIndonesian ? 'ID' : 'US'}
                svg
                style={{
                  width: '20px',
                  height: '15px',
                  display: 'block'
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