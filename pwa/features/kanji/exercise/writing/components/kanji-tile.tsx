import { cn } from '@/pwa/core/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface KanjiTileProps {
  kanji: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'available' | 'selected';
  draggable?: boolean;
  index?: number;
  id: string; // Required for @dnd-kit
}

export function KanjiTile({ 
  kanji, 
  onClick, 
  disabled = false, 
  variant = 'available',
  draggable = false,
  index,
  id
}: KanjiTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    disabled: disabled || !draggable,
    data: {
      kanji,
      variant,
      sourceIndex: index,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      disabled={disabled}
      {...attributes}
      {...listeners}
      className={cn(
        'min-w-[52px] h-12 rounded-lg border-2 flex items-center justify-center text-lg font-medium transition-all duration-200 select-none',
        variant === 'available' && !disabled && 'border-border bg-background hover:bg-accent hover:border-accent-foreground/20 hover:scale-105 active:scale-95',
        variant === 'available' && disabled && 'border-border/30 bg-muted/50 text-muted-foreground',
        variant === 'selected' && 'border-primary bg-primary/10 text-primary hover:bg-primary/15',
        disabled && 'opacity-30 cursor-not-allowed',
        isDragging && 'opacity-50 scale-95 rotate-2 shadow-lg',
        draggable && !disabled && 'cursor-grab active:cursor-grabbing touch-none hover:shadow-md',
        id === 'drag-overlay' && 'shadow-2xl border-primary bg-primary/25 scale-110 rotate-3 ring-2 ring-primary/30'
      )}
    >
      {kanji}
    </button>
  );
}