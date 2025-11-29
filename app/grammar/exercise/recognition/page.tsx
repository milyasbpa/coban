import { Suspense } from "react";
import { RecognitionExerciseContainer } from "@/pwa/features/grammar/exercise/recognition/container/recognition-exercise-container";

export default function RecognitionExercisePage() {
  return (
    <Suspense fallback={<div>Loading recognition exercise...</div>}>
      <RecognitionExerciseContainer />
    </Suspense>
  );
}
