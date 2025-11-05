import { KanjiTile } from '../components/kanji-tile';
import { useWritingExerciseStore } from '../store/writing-exercise.store';

export function KanjiSelectionGrid() {
  const { 
    shuffledKanji, 
    usedKanji, 
    showAnswer,
    addKanji,
    addUsedKanji
  } = useWritingExerciseStore();

  const handleKanjiClick = (kanji: string) => {
    if (showAnswer || usedKanji.includes(kanji)) return;
    addKanji(kanji);
    addUsedKanji(kanji);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Pilih atau drag kanji untuk merangkai kata:
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