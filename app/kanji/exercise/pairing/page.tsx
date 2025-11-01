import { Suspense } from "react";
import { KanjiPairingExerciseContainer } from "@/pwa/features/kanji/exercise/pairing/container";

export default function KanjiPairingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KanjiPairingExerciseContainer />
    </Suspense>
  );
}