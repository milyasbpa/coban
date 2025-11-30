import React from "react";

export interface WritingAnswerAreaProps {
  selectedCharacters: string[];
  onCharacterTap: (index: number) => void;
  isAnswered: boolean;
}

export const WritingAnswerArea: React.FC<WritingAnswerAreaProps> = ({
  selectedCharacters,
  onCharacterTap,
  isAnswered,
}) => {
  return (
    <div className="min-h-[120px] border-2 border-border rounded-lg bg-muted/10 p-4 flex items-center justify-center">
      {selectedCharacters.length === 0 ? (
        <div className="text-muted-foreground text-center">
          Tap characters below to build your answer
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedCharacters.map((character, index) => (
            <button
              key={`selected-${index}`}
              onClick={() => !isAnswered && onCharacterTap(index)}
              disabled={isAnswered}
              className={`
                min-w-[48px] h-[48px] px-3
                rounded-lg border-2 
                text-2xl font-bold
                transition-all duration-200
                ${
                  isAnswered
                    ? "border-border bg-muted/50 text-foreground/50 cursor-not-allowed"
                    : "border-primary/30 bg-card hover:bg-accent hover:border-primary cursor-pointer active:scale-95"
                }
              `}
            >
              {character}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
