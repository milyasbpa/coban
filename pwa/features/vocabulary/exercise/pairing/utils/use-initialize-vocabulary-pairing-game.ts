import { useEffect } from "react";
import { useVocabularyExerciseSearchParams } from "../../utils/hooks";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";

export function useInitializeVocabularyPairingGame() {
  const { categoryId, level, selectedVocabularyIds } =
    useVocabularyExerciseSearchParams();

  // Store
  const { initializeGame } = useVocabularyPairingExerciseStore();

  // Initialize game on mount
  useEffect(() => {
    if (!categoryId) return;

    // Initialize with categoryId and optional selectedVocabularyIds
    initializeGame({
      categoryId,
      level,
      selectedVocabularyIds,
    });
  }, [categoryId, level, selectedVocabularyIds, initializeGame]);
}
