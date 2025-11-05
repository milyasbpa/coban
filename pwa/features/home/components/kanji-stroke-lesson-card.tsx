import { Card, CardContent } from "@/pwa/core/components/card";
import { Badge } from "@/pwa/core/components/badge";
import { Progress } from "@/pwa/core/components/progress";
import { Button } from "@/pwa/core/components/button";
import { List } from "lucide-react";

interface KanjiStrokeLessonCardProps {
  level: string;
  lessonNumber: number;
  progress: number;
  kanjiList: string[];
  onExerciseClick?: () => void;
  onListClick?: () => void;
}

export function KanjiStrokeLessonCard({
  level,
  lessonNumber,
  progress,
  kanjiList,
  onExerciseClick,
  onListClick,
}: KanjiStrokeLessonCardProps) {
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
          <div className="flex gap-2 text-lg text-foreground items-center">
            {kanjiList.slice(0, 6).map((kanji, i) => (
              <span
                key={i}
                className="hover:text-secondary transition-colors cursor-pointer"
              >
                {kanji}
              </span>
            ))}
            {kanjiList.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{kanjiList.length - 6} more
              </Badge>
            )}
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
          className="w-full"
          variant="secondary"
          onClick={onExerciseClick}
        >
          Exercise
        </Button>
      </CardContent>
    </Card>
  );
}
