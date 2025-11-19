import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useVocabularyExerciseSearchParams() {
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");
  const level = searchParams.get("level") || "N5";
  const selectedVocabularyParam = searchParams.get("selectedVocabulary");

  const selectedVocabularyIds = useMemo(() => {
    return selectedVocabularyParam
      ? selectedVocabularyParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : undefined;
  }, [selectedVocabularyParam]);

  return {
    categoryId,
    level,
    selectedVocabularyParam,
    selectedVocabularyIds,
  };
}
