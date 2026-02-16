"use client";

import { Button } from "@/pwa/core/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPreviousKanji, getNextKanji } from "../utils/navigation";

interface CharacterNavigationProps {
  currentId: number;
  level: string;
}

export function CharacterNavigation({
  currentId,
  level,
}: CharacterNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const previousKanji = getPreviousKanji(currentId, level);
  const nextKanji = getNextKanji(currentId, level);

  const handlePrevious = () => {
    if (previousKanji) {
      const params = new URLSearchParams(searchParams);
      params.set("id", previousKanji.id.toString());
      router.push(`/kanji/character?${params.toString()}`);
    }
  };

  const handleNext = () => {
    if (nextKanji) {
      const params = new URLSearchParams(searchParams);
      params.set("id", nextKanji.id.toString());
      router.push(`/kanji/character?${params.toString()}`);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left Arrow */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        disabled={!previousKanji}
        className="hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous kanji"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Content Container */}
      <div className="flex-1" />

      {/* Right Arrow */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={!nextKanji}
        className="hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next kanji"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
