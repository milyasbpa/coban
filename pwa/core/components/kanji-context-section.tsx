import { Badge } from "@/pwa/core/components/badge";
import { Card } from "@/pwa/core/components/card";
import { BookOpen, Lightbulb, Volume2 } from "lucide-react";
import { KanjiContextData, ReadingUsage, KanjiService } from "@/pwa/core/services/kanji";
import { cn } from "@/pwa/core/lib/utils";

interface KanjiContextSectionProps {
  kanjiId: number;
  wordFurigana: string;
  level: string;
  isCorrect?: boolean;
  compact?: boolean;
}

/**
 * Kanji Context Section Component
 * Shows reading patterns and related words to solve:
 * 1. "Bingung bacanya KUN atau ON?"
 * 2. "Kanji sama di list lain susah ditebak"
 */
export function KanjiContextSection({
  kanjiId,
  wordFurigana,
  level,
  isCorrect = false,
  compact = false,
}: KanjiContextSectionProps) {
  const contextData = KanjiService.getKanjiContext(
    kanjiId,
    wordFurigana,
    level
  );

  if (!contextData) return null;

  const { kanji, currentWord, usedReading, otherReadings } = contextData;

  return (
    <div className="space-y-3 mt-4">
      {/* Current Word Breakdown - Show which reading is used */}
      {usedReading && (
        <Card className="p-3 bg-primary/10 dark:bg-primary/20 border-primary/30">
          <div className="flex items-start gap-2">
            <Volume2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Reading used in this word:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("font-bold", compact ? "text-xl" : "text-2xl")}>
                  {kanji.character}
                </span>
                <Badge
                  variant={usedReading.type === 'on' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {usedReading.type === 'on' ? 'ON' : 'KUN'}: {usedReading.reading.furigana} ({usedReading.reading.romanji})
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                in <span className="font-medium text-foreground">{currentWord.word}</span> ({currentWord.furigana})
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Reading Patterns - Show when to use which reading - Hide in compact mode */}
      {!compact && otherReadings.length > 1 && (
        <Card className="p-3 bg-card dark:bg-card">
          <div className="flex items-start gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                Reading patterns for {kanji.character}:
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {otherReadings.map((readingUsage, index) => (
              <ReadingPatternCard
                key={`${readingUsage.reading.romanji}-${index}`}
                readingUsage={readingUsage}
                kanji={kanji}
                isCurrent={
                  usedReading?.reading.romanji === readingUsage.reading.romanji
                }
              />
            ))}
          </div>
        </Card>
      )}

      {/* Memory Tip - Always show, most important for learning */}
      {usedReading && (
        <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className={cn(
                "font-medium text-yellow-900 dark:text-yellow-100 mb-1",
                compact ? "text-xs" : "text-xs"
              )}>
                💡 Memory Tip
              </p>
              <p className={cn(
                "text-yellow-800 dark:text-yellow-200",
                compact ? "text-xs" : "text-xs"
              )}>
                {KanjiService.getReadingHint(usedReading, kanji)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Reading Pattern Card - Shows examples for one reading
 */
interface ReadingPatternCardProps {
  readingUsage: ReadingUsage;
  kanji: any;
  isCurrent: boolean;
}

function ReadingPatternCard({
  readingUsage,
  kanji,
  isCurrent,
}: ReadingPatternCardProps) {
  const { reading, type, examples } = readingUsage;

  return (
    <div
      className={cn(
        "p-2 rounded-lg border-2 transition-colors",
        isCurrent
          ? "bg-primary/15 dark:bg-primary/25 border-primary/40"
          : "bg-muted/80 dark:bg-muted border-border"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge
          variant={type === 'on' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {type === 'on' ? 'ON' : 'KUN'}: {reading.furigana} ({reading.romanji})
        </Badge>
        {isCurrent && (
          <span className="text-xs font-medium text-primary">← Used here</span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground mb-1">
          Examples ({examples.length}):
        </p>
        {examples.slice(0, 3).map((example, idx) => (
          <div
            key={`${example.word}-${idx}`}
            className="text-xs pl-2 border-l-2 border-border"
          >
            <span className="font-medium">{example.word}</span>{" "}
            <span className="text-muted-foreground">({example.furigana})</span>
            <span className="text-muted-foreground"> - {example.meanings.en}</span>
          </div>
        ))}
        {examples.length > 3 && (
          <p className="text-xs text-muted-foreground pl-2">
            +{examples.length - 3} more...
          </p>
        )}
      </div>
    </div>
  );
}
