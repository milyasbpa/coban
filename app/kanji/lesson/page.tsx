import { Suspense } from "react";
import { KanjiLessonContainer } from "@/pwa/features/kanji/lesson/container/kanji-lesson-container";

export default function KanjiLessonPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KanjiLessonContainer />
    </Suspense>
  );
}