import { cn } from "@/pwa/core/lib/utils";

interface LargeKanjiDisplayProps {
  character: string;
  colorClass: string;
  className?: string;
}

export function LargeKanjiDisplay({ 
  character, 
  colorClass,
  className 
}: LargeKanjiDisplayProps) {
  return (
    <div className={cn(
      "flex items-center justify-center",
      "bg-card border-2 border-border rounded-xl",
      "w-48 h-48 mx-auto",
      "shadow-sm",
      className
    )}>
      <span className={cn(
        "text-8xl font-bold select-none",
        colorClass
      )}>
        {character}
      </span>
    </div>
  );
}
