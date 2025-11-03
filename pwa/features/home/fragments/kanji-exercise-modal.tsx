"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/pwa/core/components/dialog";
import { Progress } from "@/pwa/core/components/progress";
import { useHomeStore } from "../store/home-store";
import { useScoreStore } from "@/pwa/core/store/score.store";
import { Edit3, Book, Users } from "lucide-react";

export function KanjiExerciseModal() {
  const { exerciseModal, closeExerciseModal } = useHomeStore();
  const { getExerciseProgress } = useScoreStore();
  const { isOpen, lessonNumber, lessonId, kanjiList } = exerciseModal;

  const handleExerciseStart = (exerciseType: string) => {
    console.log(`Starting ${exerciseType} exercise for lesson ${lessonNumber}`);
    closeExerciseModal();

    if (exerciseType === "pairing") {
      // Navigate to pairing exercise with lesson data
      window.location.href = `/kanji/exercise/pairing?lessonId=${exerciseModal.lessonId}&level=N5`;
    } else if (exerciseType === "reading") {
      // Navigate to reading exercise with lesson data
      window.location.href = `/kanji/exercise/reading?lessonId=${exerciseModal.lessonId}&level=N5`;
    } else if (exerciseType === "writing") {
      // Navigate to writing exercise with lesson data
      window.location.href = `/kanji/exercise/writing?level=n5&lesson=${lessonNumber}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeExerciseModal}>
      <DialogContent className="sm:max-w-md bg-popover border-2 border-border shadow-xl backdrop-blur-sm">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto bg-foreground text-background px-4 py-1.5 rounded-full w-fit">
            <span className="text-xs font-bold tracking-wider">EXERCISES</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Lesson {lessonNumber}
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
                {Math.round(getExerciseProgress("writing", lessonId?.toString()))}%
              </div>
            </div>
            <Progress value={getExerciseProgress("writing", lessonId?.toString())} className="mb-2 h-1.5" />
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
                {Math.round(getExerciseProgress("reading", lessonId?.toString()))}%
              </div>
            </div>
            <Progress value={getExerciseProgress("reading", lessonId?.toString())} className="mb-2 h-1.5" />
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
                {Math.round(getExerciseProgress("pairing", lessonId?.toString()))}%
              </div>
            </div>
            <Progress value={getExerciseProgress("pairing", lessonId?.toString())} className="mb-2 h-1.5" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
