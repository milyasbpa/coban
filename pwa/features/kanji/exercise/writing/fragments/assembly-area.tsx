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
    gameState,
    questionState,
    removeKanji,
    removeUsedKanji,
    clearSelected,
    clearUsedKanji,
    addKanji,
    addUsedKanji,
  } = useWritingExerciseStore();

  const selectedKanji = questionState.selectedKanji;
  const correctAnswer = questionState.correctAnswer;
  const showAnswer = questionState.showAnswer;
  const availableCharacters = gameState.availableCharacters;
  const usedKanji = questionState.usedKanji;

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
    if (showAnswer || usedKanji.includes(kanji)) return;
    addKanji(kanji);
    addUsedKanji(kanji);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* Assembly Area */}
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Assembly Area</p>
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
          className={`border-2 border-dashed rounded-lg flex items-center gap-2 flex-wrap relative ${
            isOver
              ? "min-h-[80px] p-4 border-primary bg-primary/10 border-solid"
              : "min-h-[80px] p-4 border-muted-foreground/30 bg-muted/20"
          }`}
        >
          {selectedKanji.length === 0 ? (
            <div className="w-full text-center">
              <p className={`text-sm ${isOver ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {isOver ? "Drop kanji here!" : "Click or drag kanji here..."}
              </p>
            </div>
          ) : (
            <SortableContext
              items={sortableIds}
              strategy={horizontalListSortingStrategy}
            >
              {selectedKanji.map((kanji, index) => (
                <SortableKanjiTile
                  key={`assembly-${index}-${kanji}`}
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
        shuffledKanji={availableCharacters}
        usedKanji={usedKanji}
        showAnswer={showAnswer}
        onKanjiClick={handleKanjiClick}
      />
    </div>
  );
}
