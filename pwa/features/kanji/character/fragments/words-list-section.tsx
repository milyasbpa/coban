"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getCharacterData, getWordsFromCharacter, WordItem } from "../utils/character-data";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { getAccuracyColor } from "../../list/utils/accuracy-colors";
import { cn } from "@/pwa/core/lib/utils";

export function WordsListSection() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const level = searchParams.get("level") || "N5";

  const { user } = useLoginStore();
  const { 
    getKanjiMastery,
    initializeUser, 
    isInitialized 
  } = useKanjiScoreStore();

  // Initialize kanji store if authenticated
  useEffect(() => {
    if (user && !isInitialized) {
      initializeUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
    }
  }, [user, isInitialized, level, initializeUser]);

  if (!id) {
    return null;
  }

  const character = getCharacterData(id, level);
  const words = getWordsFromCharacter(character || {} as any);
  
  if (!character || words.length === 0) {
    return null;
  }
  const kanjiMastery = getKanjiMastery(character.id.toString());

  const handleWordClick = (word: WordItem) => {
    // TODO: Navigate to vocabulary detail page
  };

  return (
    <div className="p-6 bg-background">
      <div className="max-w-2xl mx-auto space-y-3">
        <h2 className="text-lg font-semibold">Words</h2>

        <div className="space-y-2">
          {words.map((word) => {
            // Get accuracy from kanji mastery for this word using simple ID
            let accuracy: number | null = null;
            if (user && kanjiMastery) {
              const wordData = kanjiMastery.words[word.id.toString()];
              
              if (wordData && wordData.totalAttempts > 0) {
                accuracy = Math.round((wordData.correctAttempts / wordData.totalAttempts) * 100);
              }
            }
            
            const colors = getAccuracyColor(accuracy);

            return (
              <button
                key={word.uniqueKey}
                onClick={() => handleWordClick(word)}
                className="w-full bg-card border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-0.5">
                    {/* Word with colored text based on accuracy */}
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-lg font-bold", colors.text)}>
                        {word.word}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {word.furigana}
                      </span>
                    </div>
                    
                    {/* Romanji */}
                    <p className="text-xs text-muted-foreground">
                      {word.romanji}
                    </p>

                    {/* Meaning */}
                    <p className="text-sm">
                      {word.meanings.en}
                    </p>
                  </div>

                  {/* Accuracy badge (if available) */}
                  {accuracy !== null && (
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold shrink-0",
                      colors.text
                    )}>
                      {accuracy}%
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {words.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No example words available for this kanji.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
