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
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Assembly Area
            </p>
            <p className="text-xs text-muted-foreground">
              Arrange characters to form the word
            </p>
          </div>
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
          className={`min-h-[80px] p-6 border-2 border-dashed rounded-xl bg-muted/20 flex items-center gap-2 flex-wrap transition-all duration-300 ease-in-out ${
            isOver
              ? "border-primary bg-primary/15 scale-[1.03] shadow-xl border-solid transform ring-2 ring-primary/30"
              : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30"
          }`}
        >
          {selectedKanji.length === 0 ? (
            <div className="w-full text-center py-4">
              <p className={`text-sm transition-colors duration-200 ${
                isOver 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground"
              }`}>
                {isOver 
                  ? "Drop kanji here to assemble the word!" 
                  : "Click or drag kanji here to start building..."}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {isOver ? "Release to add" : "Large drop zone for easy targeting"}
              </p>
            </div>
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
