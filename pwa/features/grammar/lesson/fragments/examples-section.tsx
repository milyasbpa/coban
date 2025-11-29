"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/pwa/core/components/card";
import { Button } from "@/pwa/core/components/button";
import { Volume2, Loader2 } from "lucide-react";
import { GrammarService } from "@/pwa/core/services/grammar";

export function ExamplesSection() {
  const searchParams = useSearchParams();
  const patternId = searchParams.get("patternId");
  const level = searchParams.get("level") || "N5";
  const [playingId, setPlayingId] = useState<number | null>(null);

  const pattern = patternId
    ? GrammarService.getPatternById(parseInt(patternId), level)
    : null;

  if (!pattern) return null;

  const { examples } = pattern;

  const handlePlayAudio = async (exampleId: number, furiganaText: string) => {
    setPlayingId(exampleId);

    try {
      // Use text-to-speech API with furigana text
      const utterance = new SpeechSynthesisUtterance(furiganaText);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8; // Slower for learning

      utterance.onend = () => {
        setPlayingId(null);
      };

      utterance.onerror = () => {
        setPlayingId(null);
      };

      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Audio playback error:", error);
      setPlayingId(null);
    }
  };

  return (
    <Card className="border-border bg-card gap-2">
      <CardHeader>
        <CardTitle className="text-base text-foreground">
          Examples ({examples.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {examples.map((example) => (
          <div
            key={example.id}
            className="p-3 bg-muted/30 rounded-lg space-y-2 border border-border"
          >
            {/* Audio Button & Japanese */}
            <div className="flex items-start gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-7 w-7 hover:bg-muted"
                onClick={() =>
                  handlePlayAudio(
                    example.id,
                    example.furigana.replace(/\s+/g, "")
                  )
                }
                disabled={playingId === example.id}
              >
                {playingId === example.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Volume2 className="w-4 h-4 text-foreground" />
                )}
              </Button>

              <div className="flex-1 space-y-1.5">
                {/* Japanese */}
                <p className="text-base font-medium text-foreground leading-snug">
                  {example.japanese}
                </p>

                {/* Furigana */}
                <p className="text-xs text-muted-foreground leading-snug">
                  {example.furigana}
                </p>

                {/* Romanji */}
                <p className="text-xs text-primary/80 leading-snug">
                  {example.romanji}
                </p>

                {/* Translations */}
                <div className="pt-2 border-t border-border space-y-0.5">
                  <p className="text-sm text-foreground leading-snug">
                    {example.meanings.en}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {example.meanings.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
