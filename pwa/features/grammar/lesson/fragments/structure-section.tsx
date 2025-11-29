"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/pwa/core/components/card";
import { GrammarService } from "@/pwa/core/services/grammar";

export function StructureSection() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";

  const pattern = patternId
    ? GrammarService.getPatternById(parseInt(patternId), level)
    : null;

  if (!pattern) return null;

  const { structure } = pattern;

  return (
    <Card className="border-border bg-card gap-2">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Sentence Structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Visual breakdown - More compact */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-muted/50 rounded-lg">
          {structure.components.map((component, index) => (
            <div key={index} className="flex items-center gap-1.5">
              {/* Component box - More compact */}
              {component.value ? (
                // Fixed value (particle, copula) - compact version
                <div className="px-2.5 py-1.5 bg-primary/10 border-2 border-primary/20 rounded-md">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-base font-bold text-primary">
                      {component.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {component.label.en}
                    </p>
                  </div>
                </div>
              ) : (
                // Variable part (subject, predicate, object) - compact version
                <div className="px-2.5 py-1.5 bg-background border-2 border-dashed border-muted-foreground/30 rounded-md">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                      {component.placeholder || "..."}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {component.label.en}
                    </p>
                  </div>
                  {component.example && (
                    <p className="text-[10px] text-primary mt-0.5">
                      e.g., {component.example}
                    </p>
                  )}
                </div>
              )}

              {/* Plus sign between components */}
              {index < structure.components.length - 1 && (
                <span className="text-muted-foreground text-xs">+</span>
              )}
            </div>
          ))}
        </div>

        {/* Component details - More compact */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Components:</p>
          {structure.components.map((component, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2.5 bg-muted/30 rounded-lg text-sm"
            >
              <div className="shrink-0 w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded-full text-[10px] font-bold">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="font-medium text-foreground">
                    {component.value || component.placeholder}
                  </p>
                  {component.romanji && (
                    <span className="text-xs text-muted-foreground">
                      ({component.romanji})
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {component.label.en} - {component.label.id}
                </p>
                {component.example && !component.value && (
                  <p className="text-[10px] text-primary">
                    Example: {component.example}
                  </p>
                )}
                {component.optional && (
                  <p className="text-[10px] text-muted-foreground">
                    (Optional)
                  </p>
                )}
                {component.replaces && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-500">
                    ⚠️ Replaces: {component.replaces}
                  </p>
                )}
                {component.variants && component.variants.length > 0 && (
                  <div className="text-[10px] space-y-0.5">
                    <p className="text-muted-foreground">Variants:</p>
                    <div className="space-y-0.5">
                      {component.variants.map((variant, vIdx) => (
                        <p key={vIdx} className="text-muted-foreground">
                          • {variant.value} ({variant.romanji})
                          {variant.formality && ` - ${variant.formality}`}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
