"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/pwa/core/components/card";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { GrammarService } from "@/pwa/core/services/grammar";

export function NotesSection() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";

  const pattern = patternId
    ? GrammarService.getPatternById(parseInt(patternId), level)
    : null;

  if (!pattern) return null;

  const { usage_notes: usageNotes, common_mistakes: commonMistakes } = pattern;

  return (
    <div className="space-y-3">
      {/* Usage Notes */}
      <Card className="border-border bg-card gap-2">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <CardTitle className="text-base text-foreground">
              Usage Notes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-1">
            <p className="text-sm text-foreground leading-snug">
              {usageNotes.en}
            </p>
            <p className="text-xs text-muted-foreground leading-snug">
              {usageNotes.id}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Common Mistakes */}
      {commonMistakes.length > 0 && (
        <Card className="border-border bg-card gap-2">
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
              <CardTitle className="text-base text-foreground">
                Common Mistakes
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {commonMistakes.map((mistake, index) => (
              <div
                key={index}
                className="p-3 bg-muted/30 rounded-lg space-y-2 border border-border"
              >
                {/* Incorrect */}
                <div className="flex items-start gap-1.5">
                  <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs text-muted-foreground">Incorrect:</p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 leading-snug">
                      {mistake.incorrect}
                    </p>
                  </div>
                </div>

                {/* Correct */}
                <div className="flex items-start gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs text-muted-foreground">Correct:</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 leading-snug">
                      {mistake.correct}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="pt-2 border-t border-border space-y-0.5">
                  <p className="text-xs text-foreground leading-snug">
                    {mistake.explanation.en}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    {mistake.explanation.id}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
