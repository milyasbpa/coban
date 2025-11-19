import { useEffect } from "react";
import { useVocabularyExerciseSearchParams } from "../../utils/hooks";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";

export function useInitializeVocabularyReadingGame() {
  const { categoryId, level, selectedVocabularyIds } =
    useVocabularyExerciseSearchParams();

  // Use store
  const { initializeExercise } = useVocabularyReadingExerciseStore();

  // Initialize game
  useEffect(() => {
    if (!categoryId) return;

    // Initialize with categoryId and optional selectedVocabularyIds
    initializeExercise(level, categoryId, selectedVocabularyIds);
  }, [categoryId, level, selectedVocabularyIds, initializeExercise]);
}
