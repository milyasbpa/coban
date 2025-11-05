import { Button } from "@/pwa/core/components/button";
import { Trash2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableKanjiTile } from "../components/sortable-kanji-tile";
import { CorrectAnswerDisplay } from "../components/correct-answer-display";
import { KanjiSelectionGrid } from "../components/kanji-selection-grid";
import { useWritingExerciseStore } from "../store/writing-exercise.store";

export function AssemblyArea() {
  const { 
    selectedKanji, 
    correctAnswer, 
    showAnswer,
    shuffledKanji,
    usedKanji,
    removeKanji,
    removeUsedKanji,
    clearSelected,
    clearUsedKanji,
    addKanji,
    addUsedKanji
  } = useWritingExerciseStore();

  const { setNodeRef, isOver } = useDroppable({
    id: "assembly-area",
  });

  // Generate IDs for sortable context
  const sortableIds = selectedKanji.map((_, index) => `assembly-${index}`);

  const handleRemoveKanji = (index: number) => {
    const kanjiToRemove = selectedKanji[index];
    removeKanji(index);
    // Make kanji available again in selection grid
    removeUsedKanji(kanjiToRemove);
  };

  const handleClearAll = () => {
    clearSelected();
    clearUsedKanji(); // Make all kanji available again
  };

  const handleKanjiClick = (kanji: string) => {
    addKanji(kanji);
    addUsedKanji(kanji);
  };

  return (
    <div className="space-y-6">
      {/* Assembly Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Arrange the characters below:
          </p>
          {selectedKanji.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div
          ref={setNodeRef}
          className={`min-h-[60px] p-4 border-2 border-dashed rounded-lg bg-muted/30 flex items-center gap-2 flex-wrap transition-all duration-200 ${
            isOver
              ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
              : "border-border"
          }`}
        >
          {selectedKanji.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Click or drag kanji here...
            </p>
          ) : (
            <SortableContext
              items={sortableIds}
              strategy={horizontalListSortingStrategy}
            >
              {selectedKanji.map((kanji, index) => (
                <SortableKanjiTile
                  key={index}
                  kanji={kanji}
                  index={index}
                  onRemove={() => handleRemoveKanji(index)}
                  showAnswer={showAnswer}
                />
              ))}
            </SortableContext>
          )}
        </div>

        {showAnswer && correctAnswer && (
          <CorrectAnswerDisplay correctAnswer={correctAnswer} />
        )}
      </div>

      {/* Available Kanji Selection Grid */}
      <KanjiSelectionGrid 
        shuffledKanji={shuffledKanji}
        usedKanji={usedKanji}
        showAnswer={showAnswer}
        onKanjiClick={handleKanjiClick}
      />
    </div>
  );
}
