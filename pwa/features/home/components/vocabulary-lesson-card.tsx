import { Card, CardContent } from "@/pwa/core/components/card";
import { Badge } from "@/pwa/core/components/badge";
import { Progress } from "@/pwa/core/components/progress";
import { Button } from "@/pwa/core/components/button";
import { List } from "lucide-react";

interface VocabularyLessonCardProps {
  level: string;
  lessonNumber: number;
  title: string;
  wordCount: number;
  progress: number;
  onExerciseClick?: () => void;
  onListClick?: () => void;
}

export function VocabularyLessonCard({
  level,
  lessonNumber,
  title,
  wordCount,
  progress,
  onExerciseClick,
  onListClick,
}: VocabularyLessonCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:border-ring gap-0 py-4">
      <CardContent className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {level}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Lesson {lessonNumber}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-32 h-2" />
            <span className="text-foreground font-bold text-sm">
              {progress}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {wordCount} words
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onListClick}
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>

        <Button
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          onClick={onExerciseClick}
        >
          Exercise
        </Button>
      </CardContent>
    </Card>
  );
}