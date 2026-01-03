import * as React from "react";
import { KanjiListCTA } from "./kanji-list-cta";
import { KanjiLessonsSection } from "./kanji-lessons-section";

export default function Kanji() {
  return (
    <>
      <div className="flex items-center justify-between">
        {/* Kanji List CTA */}
        <KanjiListCTA />
        {/* Removed lesson type toggle - only stroke lessons now */}
      </div>

      {/* Kanji Lessons Section */}
      <KanjiLessonsSection />
    </>
  );
}
