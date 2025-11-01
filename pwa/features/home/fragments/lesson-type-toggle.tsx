"use client";

import { useState } from "react";
import { cn } from "@/pwa/core/lib/utils";

export function LessonTypeToggle() {
  const [selectedType, setSelectedType] = useState<"stroke" | "topic">("stroke");

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-muted/50 rounded-full border border-border/50">
        <div className="flex items-center">
          {/* Stroke Option */}
          <button
            onClick={() => setSelectedType("stroke")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full",
              selectedType === "stroke"
                ? "bg-primary text-secondary border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            Stroke
          </button>

          {/* Topic Option */}
          <button
            onClick={() => setSelectedType("topic")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full",
              selectedType === "topic"
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