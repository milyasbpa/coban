"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/pwa/core/components/dialog";
import { useHomeStore } from "../store/home-store";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { ExerciseCard } from "../components/exercise-card";
import { Edit3, Book, Users } from "lucide-react";

export function KanjiExerciseModal() {
  const { kanjiExerciseModal, closeKanjiExerciseModal } = useHomeStore();
  const { getExerciseProgress } = useKanjiScoreStore();
  const { isOpen, lessonName, lessonId, topicId, lessonType, kanjiList } =
    kanjiExerciseModal;

  const handleExerciseStart = (exerciseType: string) => {
    closeKanjiExerciseModal();

    // Build URL based on lesson type
    const buildExerciseUrl = (exercise: string) => {
      const baseUrl = `/kanji/exercise/${exercise}`;
      const level = "N5"; // Could be dynamic based on selected level

      if (lessonType === "stroke" && lessonId) {
        return `${baseUrl}?lessonId=${lessonId}&level=${level}`;
      } else if (lessonType === "topic" && topicId) {
        return `${baseUrl}?topicId=${topicId}&level=${level}`;
      }

      // Fallback
      return `${baseUrl}?level=${level}`;
    };

    if (exerciseType === "pairing") {
      window.location.href = buildExerciseUrl("pairing");
    } else if (exerciseType === "reading") {
      window.location.href = buildExerciseUrl("reading");
    } else if (exerciseType === "writing") {
      window.location.href = buildExerciseUrl("writing");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeKanjiExerciseModal}>
      <DialogContent className="sm:max-w-md bg-popover border-2 border-border shadow-xl backdrop-blur-sm">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto bg-foreground text-background px-4 py-1.5 rounded-full w-fit">
            <span className="text-xs font-bold tracking-wider">EXERCISES</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {lessonName}
          </DialogTitle>
          <div className="text-center">
            <div className="text-xl font-bold text-foreground mb-3 tracking-wider">
              {kanjiList.join("、")}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Writing Exercise */}
          <ExerciseCard
            title="Writing"
            exerciseType="writing"
            Icon={Edit3}
            progress={getExerciseProgress(
              "writing",
              lessonType === "stroke"
                ? lessonId?.toString()
                : `topic_${topicId}`
            )}
            onClick={handleExerciseStart}
          />

          {/* Reading Exercise */}
          <ExerciseCard
            title="Reading"
            exerciseType="reading"
            Icon={Book}
            progress={getExerciseProgress(
              "reading",
              lessonType === "stroke"
                ? lessonId?.toString()
                : `topic_${topicId}`
            )}
            onClick={handleExerciseStart}
          />

          {/* Pairing Exercise */}
          <ExerciseCard
            title="Pairing"
            exerciseType="pairing"
            Icon={Users}
            progress={getExerciseProgress(
              "pairing",
              lessonType === "stroke"
                ? lessonId?.toString()
                : `topic_${topicId}`
            )}
            onClick={handleExerciseStart}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
