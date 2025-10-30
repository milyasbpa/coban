import { Card, CardContent } from "@/pwa/core/components/card";
import { Badge } from "@/pwa/core/components/badge";
import { Progress } from "@/pwa/core/components/progress";
import { Button } from "@/pwa/core/components/button";

interface LessonCardProps {
  level: string;
  lessonNumber: number;
  progress: number;
  kanjiList: string[];
  onExerciseClick?: () => void;
  onListClick?: () => void;
}

export function LessonCard({ 
  level, 
  lessonNumber, 
  progress, 
  kanjiList,
  onExerciseClick,
  onListClick 
}: LessonCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:border-ring">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge className="font-bold text-sm">{level}</Badge>
            <Badge
              variant="secondary"
              className="rounded-full font-bold text-sm"
            >
              Lesson {lessonNumber}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-32 h-2" />
            <span className="text-foreground font-bold text-sm">{progress}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 text-2xl text-foreground">
            {kanjiList.map((kanji, i) => (
              <span
                key={i}
                className="hover:text-secondary transition-colors cursor-pointer"
              >
                {kanji}
              </span>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            style={{
              backgroundColor: "var(--character-dark)",
              color: "var(--foreground)",
            }}
            onClick={onListClick}
          >
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-foreground rounded-full"
                ></div>
              ))}
            </div>
            List
          </Button>
        </div>

        <Button 
          className="w-full font-bold" 
          onClick={onExerciseClick}
        >
          Exercise
        </Button>
      </CardContent>
    </Card>
  );
}