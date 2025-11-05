import { KanjiTile } from "./kanji-tile";

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
  onKanjiClick,
}: KanjiSelectionGridProps) {
  const handleKanjiClick = (kanji: string) => {
    // if (showAnswer || usedKanji.includes(kanji)) return;
    onKanjiClick(kanji);
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-medium">
        Select or drag kanji to assemble the word:
      </p>
      <div className="grid grid-cols-5 gap-2.5 p-2 rounded-lg bg-muted/10 sm:grid-cols-6 md:grid-cols-8">
        {shuffledKanji.map((kanji, index) => {
          const isUsed = usedKanji.includes(kanji);
          console.log(isUsed, kanji, !showAnswer && !isUsed, "ini apasih");
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
