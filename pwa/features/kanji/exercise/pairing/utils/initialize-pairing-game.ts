import { useEffect } from "react";
import { useExerciseSearchParams } from "../../utils/hooks";
import { usePairingGameStore } from "../store";

export function useInitializePairingGame() {
  const { lessonId, topicId, level, selectedKanjiIds } =
    useExerciseSearchParams();

  // Store
  const { initializeGame } = usePairingGameStore();

  // Initialize game on mount
  useEffect(() => {
    if (!lessonId && !topicId) return;

    if (topicId) {
      // Initialize with topicId
      initializeGame(null, level, false, selectedKanjiIds, topicId);
    } else if (lessonId) {
      // Initialize with lessonId
      initializeGame(parseInt(lessonId), level, false, selectedKanjiIds);
    }
  }, [lessonId, topicId, level, selectedKanjiIds, initializeGame]);
}
