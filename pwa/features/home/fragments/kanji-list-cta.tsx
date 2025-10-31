"use client";

import { useRouter } from "next/navigation";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/pwa/core/components/button";

interface KanjiListCTAProps {
  selectedLevel?: string;
}

export function KanjiListCTA({ selectedLevel = "N5" }: KanjiListCTAProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/kanji/list?level=${selectedLevel}`);
  };

  return (
    <Button
      className="mb-6 w-full py-6 px-4 hover:shadow-lg transition-all duration-300"
      onClick={handleClick}
    >
      <div className="flex items-center justify-center gap-2">
        <Grid3X3 className="w-6 h-6" />
        <span className="font-semibold text-sm ml-2">
          {selectedLevel} Kanji list
        </span>
      </div>
    </Button>
  );
}
