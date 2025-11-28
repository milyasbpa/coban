"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getCharacterData, getWordsFromCharacter } from "../utils/character-data";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { ProgressCircle } from "../components/progress-circle";
import { StatItem } from "../components/stat-item";

export function PracticeStatsSection() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const level = searchParams.get("level") || "N5";

  const { user } = useLoginStore();
  const { 
    getKanjiMastery, 
    initializeUser: initializeKanjiUser, 
    isInitialized: isKanjiInitialized 
  } = useKanjiScoreStore();
  const {
    initializeUser: initializeVocabUser,
    isInitialized: isVocabInitialized
  } = useVocabularyScoreStore();

  // Initialize stores if authenticated
  useEffect(() => {
    if (user) {
      if (!isKanjiInitialized) {
        initializeKanjiUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
      }
      if (!isVocabInitialized) {
        initializeVocabUser(user.uid, level as "N5" | "N4" | "N3" | "N2" | "N1");
      }
    }
  }, [user, level, isKanjiInitialized, isVocabInitialized, initializeKanjiUser, initializeVocabUser]);

  if (!id || !user) {
    return null;
  }

  const character = getCharacterData(id, level);
  if (!character) {
    return null;
  }

  const kanjiMastery = getKanjiMastery(character.id.toString());
  const words = getWordsFromCharacter(character);

  // Calculate aggregate statistics across all words
  let totalAttempts = 0;
  let correctAttempts = 0;
  let wrongAttempts = 0;

  if (kanjiMastery) {
    // Aggregate all word attempts
    Object.values(kanjiMastery.words).forEach((word) => {
      totalAttempts += word.totalAttempts;
      correctAttempts += word.correctAttempts;
      wrongAttempts += word.totalAttempts - word.correctAttempts;
    });
  }

  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  // Check if there are words with data for conditional divider
  const hasWordsData = kanjiMastery && words.length > 0 && 
    words.some(word => kanjiMastery.words[word.id.toString()]);

  return (
    <div className="p-6 bg-background">
      <div className="max-w-2xl mx-auto space-y-3">
        <h2 className="text-lg font-semibold">Practice Stats</h2>

        {/* Main Stats Card */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start gap-6">
            {/* Progress Circle with proper padding */}
            <div className="flex flex-col items-center shrink-0 p-2">
              <ProgressCircle percentage={accuracy} size="md" />
            </div>

            {/* Statistics Grid */}
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
              <StatItem label="Correct" value={correctAttempts} />
              <StatItem label="Wrong" value={wrongAttempts} />
              <StatItem label="Questions" value={totalAttempts} />
              <StatItem label="Pass" value={correctAttempts} variant="muted" />
            </div>
          </div>

          {/* Words Breakdown - only show divider if there's data */}
          {hasWordsData && (
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {words.slice(0, 5).map((word) => {
                const wordData = kanjiMastery.words[word.id.toString()];
                if (!wordData) return null;

                // Word stats are already aggregated
                const wordTotal = wordData.totalAttempts;
                const wordCorrect = wordData.correctAttempts;
                const wordAccuracy = wordTotal > 0 ? Math.round((wordCorrect / wordTotal) * 100) : 0;

                return (
                  <div
                    key={word.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{word.word}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="text-muted-foreground">{word.romanji}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-muted-foreground text-xs">
                        {wordCorrect} / {wordTotal}
                      </span>
                      <span className="font-semibold min-w-[3rem] text-right">
                        {wordAccuracy}%
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {words.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Showing 5 of {words.length} words
                </p>
              )}
            </div>
          )}

          {!kanjiMastery && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                No practice data yet. Complete some exercises to see stats!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
