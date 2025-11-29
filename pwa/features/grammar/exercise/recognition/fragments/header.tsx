"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";

interface HeaderProps {
  score: number;
  correctCount: number;
  wrongCount: number;
}

export function Header({ score, correctCount, wrongCount }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastVisitedCategory", "grammar");
    }
    router.push("/");
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border supports-backdrop-filter:bg-background/80">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-semibold text-foreground">Pattern Recognition</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{score}</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-md">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {correctCount}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-md">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {wrongCount}
            </span>
          </div>

          <ThemeToggleButton />
        </div>
      </div>
    </div>
  );
}
