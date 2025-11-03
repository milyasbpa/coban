import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useExerciseSearchParams() {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId");
  const topicId = searchParams.get("topicId");
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
    topicId,
    level,
    selectedKanjiParam,
    selectedKanjiIds,
  };
}
