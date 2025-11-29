"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { GrammarService } from "@/pwa/core/services/grammar";
import { Header } from "../fragments/header";
import { PatternHeader } from "../fragments/pattern-header";
import { StructureSection } from "../fragments/structure-section";
import { ExamplesSection } from "../fragments/examples-section";
import { NotesSection } from "../fragments/notes-section";

export function GrammarLessonContainer() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";

  // Validate pattern exists
  const pattern = patternId
    ? GrammarService.getPatternById(parseInt(patternId), level)
    : null;

  useEffect(() => {
    if (!pattern) {
      console.error("Grammar pattern not found");
    }
  }, [pattern]);

  if (!pattern) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Pattern not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <Header />

      <div className="px-4 py-6 space-y-6">
        {/* Pattern Header */}
        <PatternHeader />

        {/* Structure Section */}
        <StructureSection />

        {/* Examples Section */}
        <ExamplesSection />

        {/* Usage Notes & Common Mistakes */}
        <NotesSection />
      </div>
    </div>
  );
}
