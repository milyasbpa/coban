import { KanjiTile } from '../components/kanji-tile';

interface KanjiSelectionGridProps {
  availableKanji: string[];
  usedKanji?: string[];
  onKanjiClick: (kanji: string) => void;
  disabled?: boolean;
}

export function KanjiSelectionGrid({ 
  availableKanji, 
  usedKanji = [],
  onKanjiClick, 
  disabled = false 
}: KanjiSelectionGridProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Pilih atau drag kanji untuk merangkai kata:
      </p>
      <div className="grid grid-cols-4 gap-3">
        {availableKanji.map((kanji, index) => {
          const isUsed = usedKanji.includes(kanji);
          return (
            <KanjiTile
              key={index}
              id={`selection-${kanji}-${index}`}
              kanji={kanji}
              onClick={() => onKanjiClick(kanji)}
              disabled={disabled || isUsed}
              draggable={!disabled && !isUsed}
              variant="available"
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}