"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { useTheme } from "@/pwa/core/lib/hooks/use-theme";
import Image from "next/image";

export function Header() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex justify-between items-center px-4 py-4">
        <div className="flex justify-start items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-medium">Coban</span>
        </div>

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
