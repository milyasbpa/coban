import { Card, CardContent } from "@/pwa/core/components/card";
import { Badge } from "@/pwa/core/components/badge";
import { Progress } from "@/pwa/core/components/progress";
import { Button } from "@/pwa/core/components/button";
import { List } from "lucide-react";

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
            <Badge className="font-bold text-sm bg-blue-600 text-white border border-blue-500">{level}</Badge>
            <Badge
              className="rounded-full font-bold text-sm bg-yellow-500 text-black border border-yellow-400"
            >
              Lesson {lessonNumber}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-32 h-2 bg-gray-700 [&>div]:bg-yellow-500" />
            <span className="text-foreground font-bold text-sm">{progress}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 text-lg text-foreground">
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
            <List className="w-4 h-4" />
            List
          </Button>
        </div>

        <Button 
          className="w-full font-bold bg-green-600 hover:bg-green-700 text-white border border-green-500" 
          onClick={onExerciseClick}
        >
          Exercise
        </Button>
      </CardContent>
    </Card>
  );
}