import React from "react";
import { VocabularyPairingCard } from "../components/vocabulary-pairing-card";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";

export const VocabularyPairingGrid: React.FC = () => {
  const {
    sectionState: { gameWords, selectedCards, matchedPairs, errorCards },
    selectCard,
  } = useVocabularyPairingExerciseStore();

  const handleCardClick = (card: any) => {
    // Prevent selection if 2 cards already selected
    if (selectedCards.length >= 2) return;
    
    selectCard(card);
  };

  // Separate words by type for 2-column layout
  const uniqueWords = gameWords.filter((word, index, array) => 
    array.findIndex(w => w.id === word.id) === index
  );

  // Create shuffled meanings for right column
  const shuffledMeanings = [...uniqueWords].sort(() => Math.random() - 0.5);

  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      {/* Left Column - Japanese (Kanji/Hiragana) */}
      <div className="space-y-3">
        {uniqueWords.map((word) => (
          <VocabularyPairingCard
            key={`japanese-${word.id}`}
            card={{ ...word, type: "japanese" }}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {/* Right Column - Meanings */}
      <div className="space-y-3">
        {shuffledMeanings.map((word) => (
          <VocabularyPairingCard
            key={`meaning-${word.id}`}
            card={{ ...word, type: "meaning" }}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
};