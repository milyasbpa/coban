"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";

export function HeaderSection() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 border-b border-border">
      <div className="flex items-center justify-between p-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggleButton />
      </div>
    </div>
  );
}
