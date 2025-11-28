"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/pwa/core/components/button";

export function HeaderSection() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="flex items-center gap-2 text-foreground hover:text-foreground/80 hover:bg-muted"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>
    </div>
  );
}
