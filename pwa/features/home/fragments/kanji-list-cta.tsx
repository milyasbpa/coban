"use client";

import { Grid3X3 } from "lucide-react";
import { Button } from "@/pwa/core/components/button";

export function KanjiListCTA() {
  const handleClick = () => {
    console.log("Navigate to kanji list page");
    // TODO: Navigate to all kanji list page
  };

  return (
    <Button
      className="mb-6 w-full py-6 px-4 hover:shadow-lg transition-all duration-300"
      onClick={handleClick}
    >
      <div className="flex items-center justify-center gap-2">
        <Grid3X3 className="w-6 h-6" />
        <span className="font-semibold text-sm ml-2">
          N5 Kanji list
        </span>
      </div>
    </Button>
  );
}
