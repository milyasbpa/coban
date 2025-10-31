import { Suspense } from "react";
import { ReadingExerciseContainer } from "@/pwa/features/kanji/exercise/reading/container/reading-exercise-container";

export default function ReadingExercisePage() {
  return (
    <Suspense fallback={<div>Loading reading exercise...</div>}>
      <ReadingExerciseContainer />
    </Suspense>
  );
}