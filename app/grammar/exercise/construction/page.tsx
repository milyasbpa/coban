import { Suspense } from "react";
import { ConstructionExerciseContainer } from "@/pwa/features/grammar/exercise/construction/container/construction-exercise-container";

export default function ConstructionExercisePage() {
  return (
    <Suspense fallback={<div>Loading construction exercise...</div>}>
      <ConstructionExerciseContainer />
    </Suspense>
  );
}
