import { Suspense } from "react";
import { VocabularyPairingExerciseContainer } from "@/pwa/features/vocabulary/exercise/pairing/container/vocabulary-pairing-exercise-container";

export default function VocabularyPairingExercisePage() {
  return (
    <Suspense fallback={<div>Loading pairing exercise...</div>}>
      <VocabularyPairingExerciseContainer />
    </Suspense>
  );
}
