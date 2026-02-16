"use client";

import { useSearchParams } from "next/navigation";
import { getCharacterData } from "../utils/character-data";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useLoginStore } from "@/pwa/features/login/store/login.store";
import { getAccuracyColor } from "../../list/utils/accuracy-colors";
import { LargeKanjiDisplay } from "../components/large-kanji-display";
import { KanjiReadingCard } from "../components/kanji-reading-card";
import { CharacterNavigation } from "../components/character-navigation";

export function CharacterDisplaySection() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const level = searchParams.get("level") || "N5";

  const { user } = useLoginStore();
  const { getKanjiAccuracy } = useKanjiScoreStore();

  if (!id) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Invalid kanji ID</p>
      </div>
    );
  }

  const character = getCharacterData(id, level);

  if (!character) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Kanji not found</p>
      </div>
    );
  }

  // Get accuracy for color coding
  const accuracy = user ? getKanjiAccuracy(character.id.toString()) : null;
  const colors = getAccuracyColor(accuracy);

  return (
    <div className="p-6 space-y-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Navigation with Character Display */}
        <CharacterNavigation currentId={character.id} level={level} />
        
        {/* Large Kanji Character with Card Border */}
        <LargeKanjiDisplay 
          character={character.character}
          colorClass={colors.text}
        />

        {/* Compact Reading Card */}
        <KanjiReadingCard
          kunReadings={character.readings.kun}
          onReadings={character.readings.on}
          meaning={character.meanings.en}
        />
      </div>
    </div>
  );
}
