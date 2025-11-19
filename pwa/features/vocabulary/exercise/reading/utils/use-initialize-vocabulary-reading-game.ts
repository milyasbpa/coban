import { useEffect } from "react";
import { useVocabularyExerciseSearchParams } from "../../utils/hooks";
import { useVocabularyReadingExerciseStore } from "../store/vocabulary-reading-exercise.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";

export function useInitializeVocabularyReadingGame() {
  const { categoryId, level, selectedVocabularyIds } =
    useVocabularyExerciseSearchParams();
  const { language } = useLanguage();

  // Use store
  const { initializeExercise } = useVocabularyReadingExerciseStore();

  // Initialize game
  useEffect(() => {
    if (!categoryId) return;

    // Initialize with categoryId, optional selectedVocabularyIds, and current language
    initializeExercise(level, categoryId, selectedVocabularyIds, language);
  }, [categoryId, level, selectedVocabularyIds, language, initializeExercise]);
}
