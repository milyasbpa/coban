import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/pwa/core/lib/utils";
import { X } from "lucide-react";

interface SortableKanjiTileProps {
  kanji: string;
  index: number;
  onRemove: () => void;
  showAnswer: boolean;
}

export function SortableKanjiTile({
  kanji,
  index,
  onRemove,
  showAnswer,
}: SortableKanjiTileProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: `assembly-${index}`,
    disabled: showAnswer,
    data: {
      kanji,
      sourceIndex: index,
      variant: "selected",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "relative group",
        isDragging && "z-50"
      )}
    >
      {/* Kanji Button - with drag listeners */}
      <button
        {...attributes}
        {...listeners}
        disabled={showAnswer}
        className={cn(
          "min-w-[44px] h-11 rounded-md border-2 flex items-center justify-center text-base font-medium transition-all duration-200 select-none",
          "border-primary bg-primary/10 text-primary hover:bg-primary/15",
          !showAnswer && "cursor-grab active:cursor-grabbing touch-none hover:shadow-md hover:scale-105",
          isDragging && "opacity-50 scale-105 shadow-xl",
          showAnswer && "cursor-default"
        )}
      >
        {kanji}
      </button>
      
      {/* Remove Button - separate from drag area */}
      {!showAnswer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
          aria-label="Remove kanji"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
