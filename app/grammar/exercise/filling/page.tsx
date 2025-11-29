import { Suspense } from "react";
import { FillingExerciseContainer } from "@/pwa/features/grammar/exercise/filling/container/filling-exercise-container";

export default function FillingExercisePage() {
  return (
    <Suspense fallback={<div>Loading filling exercise...</div>}>
      <FillingExerciseContainer />
    </Suspense>
  );
}
