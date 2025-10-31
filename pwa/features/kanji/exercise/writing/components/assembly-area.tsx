import { Button } from '@/pwa/core/components/button';
import { Trash2 } from 'lucide-react';
import { KanjiTile } from './kanji-tile';

interface AssemblyAreaProps {
  selectedKanji: string[];
  onRemoveKanji: (index: number) => void;
  onClear: () => void;
  correctAnswer?: string;
  showAnswer?: boolean;
}

export function AssemblyArea({ 
  selectedKanji, 
  onRemoveKanji, 
  onClear, 
  correctAnswer,
  showAnswer = false 
}: AssemblyAreaProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Rangkai kata di bawah ini:</p>
        {selectedKanji.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="min-h-[60px] p-4 border-2 border-dashed border-border rounded-lg bg-muted/30 flex items-center gap-2 flex-wrap">
        {selectedKanji.length === 0 ? (
          <p className="text-muted-foreground text-sm">Klik atau drag kanji ke sini...</p>
        ) : (
          selectedKanji.map((kanji, index) => (
            <KanjiTile
              key={index}
              kanji={kanji}
              onClick={() => onRemoveKanji(index)}
              variant="selected"
            />
          ))
        )}
      </div>

      {showAnswer && correctAnswer && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Jawaban yang benar:</p>
          <div className="flex gap-2">
            {correctAnswer.split('').map((char, index) => (
              <div
                key={index}
                className="min-w-[40px] h-10 rounded border border-green-500/30 bg-green-500/10 flex items-center justify-center text-sm font-medium text-green-700"
              >
                {char}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}