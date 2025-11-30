import React from "react";
import { CharacterTile } from "../utils/generate-character-tiles";

export interface WritingCharacterTilesProps {
  tiles: CharacterTile[];
  onTileTap: (tileId: string) => void;
  isAnswered: boolean;
}

export const WritingCharacterTiles: React.FC<WritingCharacterTilesProps> = ({
  tiles,
  onTileTap,
  isAnswered,
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {tiles.map((tile) => (
        <button
          key={tile.id}
          onClick={() => !tile.isUsed && !isAnswered && onTileTap(tile.id)}
          disabled={tile.isUsed || isAnswered}
          className={`
            min-w-[56px] h-[56px] px-3
            rounded-lg border-2
            text-2xl font-bold
            transition-all duration-200
            ${
              tile.isUsed || isAnswered
                ? "border-border/50 bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                : "border-border bg-card text-foreground hover:bg-accent hover:border-accent-foreground/20 cursor-pointer active:scale-95 shadow-sm"
            }
          `}
        >
          {tile.character}
        </button>
      ))}
    </div>
  );
};
