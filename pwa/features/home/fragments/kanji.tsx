import * as React from "react";
import { KanjiListCTA } from "./kanji-list-cta";
import { KanjiLessonTypeToggle } from "./kanji-lesson-type-toggle";
import { KanjiLessonsSection } from "./kanji-lessons-section";

export default function Kanji() {
  return (
    <>
      <div className="flex items-center justify-between">
        {/* Kanji List CTA */}
        <KanjiListCTA />
        {/* Lesson Type Toggle */}
        <KanjiLessonTypeToggle />
      </div>

      {/* Kanji Lessons Section */}
      <KanjiLessonsSection />
    </>
  );
}
