import { cn } from "@/pwa/core/lib/utils";

interface Reading {
  furigana: string;
  romanji: string;
}

interface KanjiReadingCardProps {
  kunReadings: Reading[];
  onReadings: Reading[];
  meaning: string;
  className?: string;
}

export function KanjiReadingCard({ 
  kunReadings, 
  onReadings, 
  meaning,
  className 
}: KanjiReadingCardProps) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-3 space-y-2",
      className
    )}>
      {/* Readings in compact grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Kun Reading */}
        {kunReadings.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">
              Kunyomi (訓読み)
            </h3>
            <div className="flex flex-wrap gap-1">
              {kunReadings.map((reading, index) => (
                <div
                  key={index}
                  className="bg-muted px-2 py-1 rounded-md"
                >
                  <p className="text-sm font-medium leading-tight">{reading.furigana}</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {reading.romanji}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* On Reading */}
        {onReadings.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">
              Onyomi (音読み)
            </h3>
            <div className="flex flex-wrap gap-1">
              {onReadings.map((reading, index) => (
                <div
                  key={index}
                  className="bg-muted px-2 py-1 rounded-md"
                >
                  <p className="text-sm font-medium leading-tight">{reading.furigana}</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {reading.romanji}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meaning full width */}
      <div className="space-y-1 pt-1 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase">
          Meaning
        </h3>
        <p className="text-sm leading-tight">{meaning}</p>
      </div>
    </div>
  );
}
