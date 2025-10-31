import { KanjiTile } from '../components/kanji-tile';

interface KanjiSelectionGridProps {
  availableKanji: string[];
  onKanjiClick: (kanji: string) => void;
  disabled?: boolean;
}

export function KanjiSelectionGrid({ 
  availableKanji, 
  onKanjiClick, 
  disabled = false 
}: KanjiSelectionGridProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Pilih kanji untuk merangkai kata:
      </p>
      <div className="grid grid-cols-4 gap-3">
        {availableKanji.map((kanji, index) => (
          <KanjiTile
            key={index}
            kanji={kanji}
            onClick={() => onKanjiClick(kanji)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}