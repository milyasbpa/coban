import { cn } from '@/pwa/core/lib/utils';

interface KanjiTileProps {
  kanji: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'available' | 'selected';
}

export function KanjiTile({ kanji, onClick, disabled = false, variant = 'available' }: KanjiTileProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-w-[48px] h-12 rounded-lg border-2 flex items-center justify-center text-lg font-medium transition-all duration-200 select-none',
        variant === 'available' && 'border-border bg-background hover:bg-accent hover:border-accent-foreground/20 active:scale-95',
        variant === 'selected' && 'border-primary bg-primary/10 text-primary',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {kanji}
    </button>
  );
}