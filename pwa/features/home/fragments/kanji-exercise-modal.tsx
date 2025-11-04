"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/pwa/core/components/dialog";
import { Progress } from "@/pwa/core/components/progress";
import { useHomeStore } from "../store/home-store";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import { Edit3, Book, Users } from "lucide-react";

export function KanjiExerciseModal() {
  const { kanjiExerciseModal, closeKanjiExerciseModal } = useHomeStore();
  const { getExerciseProgress } = useScoreStore();
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
      // Writing exercise uses different parameter format
      if (lessonType === "stroke") {
        // For stroke lessons, extract number from lessonName (e.g., "Lesson 1" -> "1")
        const lessonNumber = lessonName?.match(/\d+/)?.[0] || "1";
        window.location.href = `/kanji/exercise/writing?level=n5&lesson=${lessonNumber}`;
      } else if (lessonType === "topic") {
        window.location.href = `/kanji/exercise/writing?level=n5&topic=${topicId}`;
      }
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
          <div
            className="bg-card border-2 border-border rounded-xl p-4 hover:bg-muted/30 transition-colors shadow-sm cursor-pointer"
            onClick={() => handleExerciseStart("writing")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground text-sm">
                  Writing
                </span>
              </div>
              <div className="text-right text-sm font-medium text-foreground">
                {Math.round(
                  getExerciseProgress(
                    "writing",
                    lessonType === "stroke"
                      ? lessonId?.toString()
                      : `topic_${topicId}`
                  )
                )}
                %
              </div>
            </div>
            <Progress
              value={getExerciseProgress(
                "writing",
                lessonType === "stroke"
                  ? lessonId?.toString()
                  : `topic_${topicId}`
              )}
              className="mb-2 h-1.5"
            />
          </div>

          {/* Reading Exercise */}
          <div
            className="bg-card border-2 border-border rounded-xl p-4 hover:bg-muted/30 transition-colors shadow-sm cursor-pointer"
            onClick={() => handleExerciseStart("reading")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground text-sm">
                  Reading
                </span>
              </div>
              <div className="text-right text-sm font-medium text-foreground">
                {Math.round(
                  getExerciseProgress(
                    "reading",
                    lessonType === "stroke"
                      ? lessonId?.toString()
                      : `topic_${topicId}`
                  )
                )}
                %
              </div>
            </div>
            <Progress
              value={getExerciseProgress(
                "reading",
                lessonType === "stroke"
                  ? lessonId?.toString()
                  : `topic_${topicId}`
              )}
              className="mb-2 h-1.5"
            />
          </div>

          {/* Pairing Exercise */}
          <div
            className="bg-card border-2 border-border rounded-xl p-4 hover:bg-muted/30 transition-colors shadow-sm cursor-pointer"
            onClick={() => handleExerciseStart("pairing")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground text-sm">
                  Pairing
                </span>
              </div>
              <div className="text-right text-sm font-medium text-foreground">
                {Math.round(
                  getExerciseProgress(
                    "pairing",
                    lessonType === "stroke"
                      ? lessonId?.toString()
                      : `topic_${topicId}`
                  )
                )}
                %
              </div>
            </div>
            <Progress
              value={getExerciseProgress(
                "pairing",
                lessonType === "stroke"
                  ? lessonId?.toString()
                  : `topic_${topicId}`
              )}
              className="mb-2 h-1.5"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
