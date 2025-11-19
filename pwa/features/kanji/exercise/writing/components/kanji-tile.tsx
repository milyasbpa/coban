import { cn } from "@/pwa/core/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface KanjiTileProps {
  kanji: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "available" | "selected";
  draggable?: boolean;
  index?: number;
  id: string; // Required for @dnd-kit
}

export function KanjiTile({
  kanji,
  onClick,
  disabled = false,
  variant = "available",
  draggable = false,
  index,
  id,
}: KanjiTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: disabled || !draggable,
      data: {
        kanji,
        variant,
        sourceIndex: index,
      },
    });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  // Handle click vs drag conflict
  const handleInteraction = (e: React.MouseEvent) => {
    // Only trigger click if not dragging
    if (!isDragging) {
      onClick();
    }
  };
  
  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={handleInteraction}
      disabled={disabled}
      {...attributes}
      {...(draggable && !disabled ? listeners : {})}
      className={cn(
        // Base styles - smaller size for better fit
        "min-w-[40px] h-10 rounded-md border-2 flex items-center justify-center text-base font-medium select-none",
        // Available variant styles
        variant === "available" &&
          !disabled &&
          "border-border bg-background hover:bg-accent hover:border-accent-foreground/20",
        variant === "available" &&
          disabled &&
          "border-border/30 bg-muted/50 text-muted-foreground",
        // Selected variant styles - slightly larger
        variant === "selected" &&
          "min-w-[44px] h-11 border-primary bg-primary/10 text-primary hover:bg-primary/15",
        // State styles
        disabled && "hidden cursor-not-allowed",
        isDragging && "opacity-40",
        draggable &&
          !disabled &&
          "cursor-grab active:cursor-grabbing touch-none",
      )}
    >
      {kanji}
    </button>
  );
}
