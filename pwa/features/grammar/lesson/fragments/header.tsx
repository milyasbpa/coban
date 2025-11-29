"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";

export function Header() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Grammar Lesson</h1>
        </div>

        <ThemeToggleButton />
      </div>
    </div>
  );
}
