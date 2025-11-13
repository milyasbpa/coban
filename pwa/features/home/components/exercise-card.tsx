import { Progress } from "@/pwa/core/components/progress";
import { LucideIcon } from "lucide-react";

interface ExerciseCardProps {
  /**
   * Exercise type name for display
   */
  title: string;
  /**
   * Exercise type identifier (used for API calls)
   */
  exerciseType: string;
  /**
   * Icon component from lucide-react
   */
  Icon: LucideIcon;
  /**
   * Progress percentage (0-100)
   */
  progress: number;
  /**
   * Click handler when card is clicked
   */
  onClick: (exerciseType: string) => void;
}

/**
 * Reusable exercise card component for home modal
 * Displays exercise info with progress and handles click events
 */
export function ExerciseCard({
  title,
  exerciseType,
  Icon,
  progress,
  onClick,
}: ExerciseCardProps) {
  return (
    <div
      className="bg-card border-2 border-border rounded-xl p-4 hover:bg-muted/30 transition-colors shadow-sm cursor-pointer"
      onClick={() => onClick(exerciseType)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-foreground" />
          <span className="font-medium text-foreground text-sm">
            {title}
          </span>
        </div>
        <div className="text-right text-sm font-medium text-foreground">
          {progress}%
        </div>
      </div>
      <Progress
        value={progress}
        className="mb-2 h-1.5"
      />
    </div>
  );
}