import { useEffect } from "react";
import { useExerciseSearchParams } from "../../utils/hooks";
import { useReadingExerciseStore } from "../store";
import { getReadingGameData } from "./reading-game";

export function useInitializeReadingGames() {
  const { lessonId, level, selectedKanjiIds } =
    useExerciseSearchParams();

  // Use store
  const { initializeGame } = useReadingExerciseStore();

  // Initialize game
  useEffect(() => {
    if (!lessonId) return;

    // Initialize with lessonId
    const gameData = getReadingGameData(
      parseInt(lessonId),
      level,
      selectedKanjiIds
    );
    initializeGame(gameData.questions);
  }, [lessonId, level, selectedKanjiIds, initializeGame]);
}
