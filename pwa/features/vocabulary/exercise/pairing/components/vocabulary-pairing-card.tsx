import React from "react";
import { Card } from "@/pwa/core/components/card";
import { VocabularySelectedCard, useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { useVocabularyPairingDisplayOptions } from "../store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { getVocabularyCardId, SupportedLanguage } from "@/pwa/features/vocabulary/shared/utils/language-helpers";

interface VocabularyPairingCardProps {
  card: VocabularySelectedCard;
  onCardClick: (card: VocabularySelectedCard) => void;
}

export const VocabularyPairingCard: React.FC<VocabularyPairingCardProps> = ({
  card,
  onCardClick,
}) => {
  const {
    sectionState: { selectedCards, matchedPairs, errorCards }
  } = useVocabularyPairingExerciseStore();
  
  const { language } = useLanguage();
  const { displayHiragana, displayRomaji, displayKanji } = useVocabularyPairingDisplayOptions();

  const isSelected = selectedCards.some(selected => 
    selected.id === card.id && selected.type === card.type
  );

  const isMatched = matchedPairs.has(card.id);

  // Use getVocabularyCardId to match how errorCards are set in grid
  const cardId = getVocabularyCardId(card.type, card, language as SupportedLanguage);
  const isError = errorCards.has(cardId);

  const getCardContent = () => {
    if (card.type === "japanese") {
      // Show content based on display options
      if (displayKanji && card.kanji) {
        return card.kanji;
      } else {
        return card.hiragana; // Fallback to hiragana if kanji disabled or not available
      }
    } else {
      // Show meaning based on selected language
      if (language === 'id') {
        return card.meanings.id; // Indonesian meaning
      } else {
        return card.meanings.en; // English meaning
      }
    }
  };

  const getCardSubtext = () => {
    if (card.type === "japanese") {
      const subtexts: string[] = [];
      
      // Add hiragana if enabled and kanji is shown
      if (displayHiragana && displayKanji && card.kanji && card.hiragana) {
        subtexts.push(card.hiragana);
      }
      
      // Add romaji if enabled
      if (displayRomaji && card.romaji) {
        subtexts.push(card.romaji);
      }
      
      return subtexts.length > 0 ? subtexts.join(' • ') : null;
    }
    return null;
  };

  const getCardClassName = () => {
    const baseClasses = "h-28 cursor-pointer transition-all duration-200 flex items-center justify-center text-center select-none p-3";
    
    if (isMatched) {
      return `${baseClasses} bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300`;
    }
    
    if (isError) {
      return `${baseClasses} bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 animate-pulse`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 scale-105`;
    }
    
    return `${baseClasses} hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-102`;
  };

  return (
    <Card
      className={getCardClassName()}
      onClick={() => !isMatched && !isError && onCardClick(card)}
    >
      <div className="space-y-1 w-full">
        <div className="text-lg font-semibold wrap-break-word">
          {getCardContent()}
        </div>
        {getCardSubtext() && (
          <div className="text-xs text-gray-600 wrap-break-word leading-tight">
            {getCardSubtext()}
          </div>
        )}
      </div>
    </Card>
  );
};