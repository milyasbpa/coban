import { Button } from "@/pwa/core/components/button";
import type { Level } from "@/types/kanji";

interface LevelButtonProps {
  level: Level;
  isActive?: boolean;
  onClick?: (levelId: string) => void;
}

export function LevelButton({ level, isActive = false, onClick }: LevelButtonProps) {
  return (
    <Button
      className="rounded-full px-6 py-2 font-medium border-2"
      variant={isActive ? "default" : "outline"}
      style={isActive ? { borderColor: "var(--primary)" } : undefined}
      onClick={() => onClick?.(level.id)}
    >
      {level.name}
    </Button>
  );
}