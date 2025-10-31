import { Suspense } from "react";
import { PairingExerciseContainer } from "@/pwa/features/kanji/exercise/pairing/container/pairing-exercise-container";

export default function PairingExercisePage() {
  return (
    <Suspense fallback={<div>Loading exercise...</div>}>
      <PairingExerciseContainer />
    </Suspense>
  );
}