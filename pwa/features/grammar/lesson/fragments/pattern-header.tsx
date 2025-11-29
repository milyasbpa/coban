"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/pwa/core/components/card";
import { GrammarService } from "@/pwa/core/services/grammar";

export function PatternHeader() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";

  const pattern = patternId
    ? GrammarService.getPatternById(parseInt(patternId), level)
    : null;

  if (!pattern) return null;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        {/* Level Badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
            {level}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
            {pattern.category.name.en}
          </span>
        </div>

        {/* Pattern Display */}
        <div className="space-y-2">
          {/* Romanji & Japanese - Combined */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pattern</p>
            <h2 className="text-xl font-bold text-foreground">{pattern.romanji}</h2>
            <h1 className="text-2xl font-bold text-primary">
              {pattern.japanese}
            </h1>
          </div>

          {/* Meanings */}
          <div className="pt-2 border-t border-border space-y-0.5">
            <p className="text-xs text-muted-foreground">Meaning</p>
            <p className="text-sm font-medium text-foreground">{pattern.meanings.en}</p>
            <p className="text-xs text-muted-foreground">
              {pattern.meanings.id}
            </p>
          </div>

          {/* Function */}
          <div className="pt-2 border-t border-border space-y-0.5">
            <p className="text-xs text-muted-foreground">Function</p>
            <p className="text-sm text-foreground leading-snug">{pattern.function.en}</p>
            <p className="text-xs text-muted-foreground leading-snug">
              {pattern.function.id}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
