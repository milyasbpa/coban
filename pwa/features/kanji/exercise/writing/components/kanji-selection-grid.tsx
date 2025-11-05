import { KanjiTile } from './kanji-tile';

interface KanjiSelectionGridProps {
  shuffledKanji: string[];
  usedKanji: string[];
  showAnswer: boolean;
  onKanjiClick: (kanji: string) => void;
}

export function KanjiSelectionGrid({
  shuffledKanji,
  usedKanji,
  showAnswer,
  onKanjiClick
}: KanjiSelectionGridProps) {
  const handleKanjiClick = (kanji: string) => {
    if (showAnswer || usedKanji.includes(kanji)) return;
    onKanjiClick(kanji);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Select or drag kanji to assemble the word:
      </p>
      <div className="grid grid-cols-4 gap-3">
        {shuffledKanji.map((kanji, index) => {
          const isUsed = usedKanji.includes(kanji);
          return (
            <KanjiTile
              key={index}
              id={`selection-${kanji}-${index}`}
              kanji={kanji}
              onClick={() => handleKanjiClick(kanji)}
              disabled={showAnswer || isUsed}
              draggable={!showAnswer && !isUsed}
              variant="available"
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}