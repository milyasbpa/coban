"use client";

import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";
import { ResetStatisticsButton } from "@/pwa/features/score/components/reset-statistics-button";
import Image from "next/image";

export function Header() {

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

        <div className="flex items-center gap-2">
          <ResetStatisticsButton />
          <ThemeToggleButton />
        </div>
      </div>
    </div>
  );
}
