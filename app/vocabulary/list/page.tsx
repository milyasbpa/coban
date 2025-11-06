import { Suspense } from "react";
import { VocabularyListContainer } from "@/pwa/features/vocabulary/list/container/vocabulary-list-container";

export default function VocabularyListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VocabularyListContainer />
    </Suspense>
  );
}