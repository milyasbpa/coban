import { Suspense } from "react";
import { VocabularyWritingExerciseContainer } from "@/pwa/features/vocabulary/exercise/writing/container/vocabulary-writing-exercise-container";

interface PageProps {
  searchParams: Promise<{
    level?: string;
    categoryId?: string;
  }>;
}

export default async function VocabularyWritingExercisePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const level = params.level || "n5";
  const categoryId = params.categoryId || "ANGKA";

  return (
    <Suspense fallback={<div>Loading writing exercise...</div>}>
      <VocabularyWritingExerciseContainer level={level} categoryId={categoryId} />
    </Suspense>
  );
}