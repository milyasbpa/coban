"use client";

import { Button } from "@/pwa/core/components/button";
import { Card, CardContent } from "@/pwa/core/components/card";
import { Progress } from "@/pwa/core/components/progress";
import { BookOpen, Dumbbell } from "lucide-react";

interface GrammarLessonCardProps {
  level: string;
  lessonNumber: number;
  pattern: string; // romanji
  japanese: string;
  categoryName: string;
  exampleCount: number;
  progress?: number;
  onExerciseClick: () => void;
  onListClick: () => void;
  showProgress?: boolean;
}

export function GrammarLessonCard({
  level,
  lessonNumber,
  pattern,
  japanese,
  categoryName,
  exampleCount,
  progress = 0,
  onExerciseClick,
  onListClick,
  showProgress = false,
}: GrammarLessonCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Pattern info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                #{lessonNumber}
              </span>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                {level}
              </span>
            </div>

            {/* Pattern & Japanese */}
            <h3 className="font-semibold text-base mb-1 truncate">
              {pattern}
            </h3>
            <p className="text-lg text-muted-foreground mb-2">{japanese}</p>

            {/* Category & Example count */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="truncate">{categoryName}</span>
              <span className="shrink-0">
                {exampleCount} {exampleCount === 1 ? "example" : "examples"}
              </span>
            </div>

            {/* Progress bar */}
            {showProgress && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          {/* Right side - Action buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full min-w-[100px]"
              onClick={onListClick}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="text-xs">Learn</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="w-full min-w-[100px]"
              onClick={onExerciseClick}
            >
              <Dumbbell className="w-4 h-4 mr-1" />
              <span className="text-xs">Practice</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
