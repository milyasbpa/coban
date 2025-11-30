import { Suspense } from "react";
import { VocabularyWritingExerciseContainer } from "@/pwa/features/vocabulary/exercise/writing/container/vocabulary-writing-exercise-container";

export default function VocabularyWritingExercisePage() {
  return (
    <Suspense fallback={<div>Loading writing exercise...</div>}>
      <VocabularyWritingExerciseContainer />
    </Suspense>
  );
}