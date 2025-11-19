import { Suspense } from "react";
import { VocabularyReadingExerciseContainer } from "@/pwa/features/vocabulary/exercise/reading/container/vocabulary-reading-exercise-container";

export default function VocabularyReadingExercisePage() {
  return (
    <Suspense fallback={<div>Loading reading exercise...</div>}>
      <VocabularyReadingExerciseContainer />
    </Suspense>
  );
}