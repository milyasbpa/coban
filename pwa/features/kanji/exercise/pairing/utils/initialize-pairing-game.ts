import { useEffect } from "react";
import { useExerciseSearchParams } from "../../utils/hooks";
import { usePairingGameStore } from "../store";

export function useInitializePairingGame() {
  const { lessonId, level, selectedKanjiIds } =
    useExerciseSearchParams();

  // Store
  const { initializeGame } = usePairingGameStore();

  // Initialize game on mount
  useEffect(() => {
    if (!lessonId) return;

    // Initialize with lessonId
    initializeGame({
      lessonId: parseInt(lessonId),
      level,
      shouldResetSectionIndex: false,
      selectedKanjiIds,
    });
  }, [lessonId, level, selectedKanjiIds, initializeGame]);
}
