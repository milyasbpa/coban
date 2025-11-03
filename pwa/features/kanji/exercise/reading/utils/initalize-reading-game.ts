import { useEffect } from "react";
import { useExerciseSearchParams } from "../../utils/hooks";
import { useReadingExerciseStore } from "../store";
import { getReadingGameData } from "./reading-game";

export function useInitializeReadingGames() {
  const { lessonId, topicId, level, selectedKanjiIds } =
    useExerciseSearchParams();

  // Use store
  const { initializeGame } = useReadingExerciseStore();

  // Initialize game
  useEffect(() => {
    if (!lessonId && !topicId) return;

    if (topicId) {
      // Initialize with topicId
      const gameData = getReadingGameData(
        null,
        level,
        selectedKanjiIds,
        topicId
      );
      initializeGame(gameData.questions, gameData.totalQuestions);
    } else if (lessonId) {
      // Initialize with lessonId
      const gameData = getReadingGameData(
        parseInt(lessonId),
        level,
        selectedKanjiIds
      );
      initializeGame(gameData.questions, gameData.totalQuestions);
    }
  }, [lessonId, topicId, level, selectedKanjiIds, initializeGame]);
}
