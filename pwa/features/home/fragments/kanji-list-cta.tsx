"use client";

import { useRouter } from "next/navigation";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { useHomeSettingsStore } from "../store/home-settings.store";

export function KanjiListCTA() {
  const router = useRouter();
  const { selectedLevel } = useHomeSettingsStore();
  
  const handleClick = () => {
    router.push(`/kanji/list?level=${selectedLevel}`);
  };

  return (
    <Button
      className="mb-6 w-fit py-4 px-4 hover:shadow-lg transition-all duration-300"
      onClick={handleClick}
    >
      <div className="flex items-center justify-center gap-2">
        <Grid3X3 className="w-6 h-6" />
        <span className="font-semibold text-sm ml-2">
          {/* {selectedLevel} Kanji list */}
          List
        </span>
      </div>
    </Button>
  );
}
