import React from "react";
import { VocabularyPairingCard } from "./vocabulary-pairing-card";
import { VocabularySelectedCard } from "../store/vocabulary-pairing-exercise.store";

interface VocabularyPairingGridProps {
  cards: VocabularySelectedCard[];
  selectedCards: VocabularySelectedCard[];
  matchedPairs: Set<string>;
  errorCards: Set<string>;
  onCardClick: (card: VocabularySelectedCard) => void;
}

export const VocabularyPairingGrid: React.FC<VocabularyPairingGridProps> = ({
  cards,
  selectedCards,
  matchedPairs,
  errorCards,
  onCardClick,
}) => {
  const isCardSelected = (card: VocabularySelectedCard) => {
    return selectedCards.some(selected => 
      selected.id === card.id && selected.type === card.type
    );
  };

  const isCardMatched = (card: VocabularySelectedCard) => {
    return matchedPairs.has(card.id.toString());
  };

  const isCardError = (card: VocabularySelectedCard) => {
    return errorCards.has(`${card.id}-${card.type}`);
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {cards.map((card, index) => (
        <VocabularyPairingCard
          key={`${card.id}-${card.type}-${index}`}
          card={card}
          isSelected={isCardSelected(card)}
          isMatched={isCardMatched(card)}
          isError={isCardError(card)}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
};