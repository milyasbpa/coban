import React from "react";
import { Card } from "@/pwa/core/components/card";
import { VocabularySelectedCard } from "../store/vocabulary-pairing-exercise.store";

interface VocabularyPairingCardProps {
  card: VocabularySelectedCard;
  isSelected: boolean;
  isMatched: boolean;
  isError: boolean;
  onClick: (card: VocabularySelectedCard) => void;
}

export const VocabularyPairingCard: React.FC<VocabularyPairingCardProps> = ({
  card,
  isSelected,
  isMatched,
  isError,
  onClick,
}) => {
  const getCardContent = () => {
    if (card.type === "japanese") {
      // Show kanji if available, otherwise hiragana
      return card.kanji || card.hiragana;
    } else {
      // Show Indonesian meaning
      return card.meanings.id;
    }
  };

  const getCardSubtext = () => {
    if (card.type === "japanese" && card.kanji) {
      // Show hiragana reading for kanji cards
      return card.hiragana;
    }
    return null;
  };

  const getCardVariant = () => {
    if (isMatched) return "default"; // Matched cards stay highlighted
    if (isError) return "destructive"; // Error cards are red
    if (isSelected) return "secondary"; // Selected cards are highlighted
    return "outline"; // Default cards
  };

  const getCardClassName = () => {
    const baseClasses = "h-24 cursor-pointer transition-all duration-200 flex items-center justify-center text-center select-none";
    
    if (isMatched) {
      return `${baseClasses} bg-green-100 border-green-300 text-green-800`;
    }
    
    if (isError) {
      return `${baseClasses} bg-red-100 border-red-300 text-red-800 animate-pulse`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-blue-100 border-blue-300 text-blue-800 scale-105`;
    }
    
    return `${baseClasses} hover:bg-gray-50 hover:border-gray-300 hover:scale-102`;
  };

  return (
    <Card
      className={getCardClassName()}
      onClick={() => !isMatched && !isError && onClick(card)}
    >
      <div className="space-y-1">
        <div className="text-lg font-semibold">
          {getCardContent()}
        </div>
        {getCardSubtext() && (
          <div className="text-sm text-gray-600">
            {getCardSubtext()}
          </div>
        )}
      </div>
    </Card>
  );
};