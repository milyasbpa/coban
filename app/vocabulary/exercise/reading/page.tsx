import { Suspense } from "react";
import { VocabularyReadingExerciseContainer } from "@/pwa/features/vocabulary/exercise/reading/container/vocabulary-reading-exercise-container";

interface PageProps {
  searchParams: Promise<{
    level?: string;
    categoryId?: string;
  }>;
}

export default async function VocabularyReadingExercisePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const level = params.level || "n5";
  const categoryId = params.categoryId || "ANGKA";

  return (
    <Suspense fallback={<div>Loading reading exercise...</div>}>
      <VocabularyReadingExerciseContainer level={level} categoryId={categoryId} />
    </Suspense>
  );
}