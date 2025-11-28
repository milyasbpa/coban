import { Suspense } from "react";
import { KanjiCharacterContainer } from "@/pwa/features/kanji/character/container/kanji-character-container";

export default function KanjiCharacterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <KanjiCharacterContainer />
    </Suspense>
  );
}
