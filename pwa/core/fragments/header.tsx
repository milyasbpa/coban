"use client";

import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { useTheme } from "@/pwa/core/lib/hooks/use-theme";

export function Header() {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleMenuClick = () => {
    console.log("Menu clicked");
    // TODO: Open navigation menu
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex justify-between items-center px-4 py-4">
        <Button
          variant="ghost"
          className="text-foreground font-medium p-0 h-auto flex items-center gap-2"
          onClick={handleMenuClick}
        >
          <Menu className="w-5 h-5" />
          menu
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
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
  );
}