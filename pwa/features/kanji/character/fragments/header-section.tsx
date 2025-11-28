"use client";

import { Button } from "@/pwa/core/components/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";

export function HeaderSection() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-lg font-semibold">Kanji Detail</h1>
        
        <ThemeToggleButton />
      </div>
    </header>
  );
}
