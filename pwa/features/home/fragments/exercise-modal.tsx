"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/pwa/core/components/dialog";
import { Progress } from "@/pwa/core/components/progress";
import { useHomeStore } from "../store/home-store";
import { Edit3, Book, Users } from "lucide-react";

export function ExerciseModal() {
  const { exerciseModal, closeExerciseModal } = useHomeStore();
  const { isOpen, lessonNumber, kanjiList } = exerciseModal;

  const handleExerciseStart = (exerciseType: string) => {
    console.log(`Starting ${exerciseType} exercise for lesson ${lessonNumber}`);
    // TODO: Navigate to specific exercise type
    closeExerciseModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeExerciseModal}>
      <DialogContent className="sm:max-w-md bg-popover border-2 border-border shadow-xl backdrop-blur-sm">
        <DialogHeader className="text-center space-y-3">
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
          <div className="bg-card border-2 border-border rounded-xl p-4 hover:bg-muted/30 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground text-sm">Writing</span>
              </div>
            </div>
            <Progress value={92} className="mb-2 h-1.5" />
            <div className="text-right text-sm font-medium text-foreground">92%</div>
          </div>

          {/* Reading Exercise */}
          <div className="bg-card border-2 border-border rounded-xl p-4 hover:bg-muted/30 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground text-sm">Reading</span>
              </div>
            </div>
            <Progress value={100} className="mb-2 h-1.5" />
            <div className="text-right text-sm font-medium text-foreground">100%</div>
          </div>

          {/* Pairing Exercise */}
          <div className="bg-card border-2 border-border rounded-xl p-4 hover:bg-muted/30 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground text-sm">Pairing</span>
              </div>
            </div>
            <Progress value={100} className="mb-2 h-1.5" />
            <div className="text-right text-sm font-medium text-foreground">100%</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
