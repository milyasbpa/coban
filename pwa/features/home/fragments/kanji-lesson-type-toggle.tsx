"use client";

import { cn } from "@/pwa/core/lib/utils";
import { useHomeSettingsStore } from "../store/home-settings.store";

export function KanjiLessonTypeToggle() {
  const { selectedLessonType, setSelectedLessonType } = useHomeSettingsStore();
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-muted/50 rounded-full border border-border/50">
        <div className="flex items-center">
          {/* Stroke Option */}
          <button
            onClick={() => setSelectedLessonType("stroke")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full",
              selectedLessonType === "stroke"
                ? "bg-primary text-secondary border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            Stroke
          </button>

          {/* Topic Option */}
          <button
            onClick={() => setSelectedLessonType("topic")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full",
              selectedLessonType === "topic"
                ? "bg-primary text-secondary border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            Topic
          </button>
        </div>
      </div>
    </div>
  );
}