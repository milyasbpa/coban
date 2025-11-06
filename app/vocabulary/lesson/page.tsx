import { Suspense } from "react";
import { VocabularyLessonContainer } from "@/pwa/features/vocabulary/lesson/container/vocabulary-lesson-container";

export default function VocabularyLessonPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VocabularyLessonContainer />
    </Suspense>
  );
}