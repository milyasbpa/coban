import { Suspense } from "react";
import { KanjiListContainer } from "@/pwa/features/kanji/list/container/kanji-list-container";

export default function KanjiListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KanjiListContainer />
    </Suspense>
  );
}