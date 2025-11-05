import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanjiTile } from "./kanji-tile";

interface SortableKanjiTileProps {
  kanji: string;
  index: number;
  onRemove: () => void;
  showAnswer: boolean;
}

export function SortableKanjiTile({
  kanji,
  index,
  onRemove,
  showAnswer,
}: SortableKanjiTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `assembly-${index}`,
      disabled: showAnswer,
      data: {
        kanji,
        sourceIndex: index,
        variant: "selected",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanjiTile
        id={`assembly-${index}`}
        kanji={kanji}
        onClick={onRemove}
        variant="selected"
        draggable={false} // Disable draggable on inner component to avoid conflict
        index={index}
      />
    </div>
  );
}
