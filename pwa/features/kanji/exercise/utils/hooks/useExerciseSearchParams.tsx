import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useExerciseSearchParams() {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId");
  const level = searchParams.get("level") || "N5";
  const selectedKanjiParam = searchParams.get("selectedKanji");

  const selectedKanjiIds = useMemo(() => {
    return selectedKanjiParam
      ? selectedKanjiParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : undefined;
  }, [selectedKanjiParam]);
  return {
    lessonId,
    level,
    selectedKanjiParam,
    selectedKanjiIds,
  };
}
