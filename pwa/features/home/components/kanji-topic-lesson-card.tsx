import { Card, CardContent } from "@/pwa/core/components/card";
import { Badge } from "@/pwa/core/components/badge";
import { Button } from "@/pwa/core/components/button";
import { BookOpen, Dumbbell } from "lucide-react";

interface KanjiTopicLessonCardProps {
  level: string;
  name: string;
  progress: number;
  kanjiList: string[];
  onExerciseClick?: () => void;
  onListClick?: () => void;
  showProgress?: boolean;
}

export function KanjiTopicLessonCard({
  level,
  name,
  progress,
  kanjiList,
  onExerciseClick,
  onListClick,
  showProgress = false,
}: KanjiTopicLessonCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:border-ring gap-0 py-4">
      <CardContent className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {level}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {name}
            </Badge>
          </div>
          {showProgress && (
            <div className="flex items-center gap-2">
              <span className="text-foreground font-bold text-sm">
                {progress}%
              </span>
            </div>
          )}
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
        </div>

        <div className="grid grid-cols-2 place-content-center place-items-center gap-2 w-full">
          <Button
            variant="default"
            size="sm"
            className="w-full min-w-[100px]"
            onClick={onExerciseClick}
          >
            <Dumbbell className="w-4 h-4 mr-1" />
            <span className="text-xs">Practice</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full min-w-[100px]"
            onClick={onListClick}
          >
            <BookOpen className="w-4 h-4 mr-1" />
            <span className="text-xs">Learn</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
