import React, { useMemo } from "react";
import { VocabularyPairingCard } from "../components/vocabulary-pairing-card";
import { useVocabularyPairingExerciseStore } from "../store/vocabulary-pairing-exercise.store";
import { VocabularySelectedCard } from "../store/vocabulary-pairing-exercise.store";

export const VocabularyPairingGrid: React.FC = () => {
  const {
    sectionState: { gameWords, selectedCards, matchedPairs, errorCards },
    setSelectedCards,
    setMatchedPairs,
    setErrorCards,
    addWordError,
    removeWordError,
    incrementCorrectPairs,
    moveToNextSection,
    calculateAndSetScore,
    setGameComplete,
  } = useVocabularyPairingExerciseStore();

  // Separate words by type for 2-column layout
  const uniqueWords = gameWords.filter((word, index, array) => 
    array.findIndex(w => w.id === word.id) === index
  );

  // Create shuffled meanings for right column using useMemo to prevent re-shuffle
  const shuffledMeanings = useMemo(() => {
    return [...uniqueWords].sort(() => Math.random() - 0.5);
  }, [gameWords]); // Use gameWords as dependency, not uniqueWords

  const handleCardClick = (type: "japanese" | "meaning", word: any) => {
    // Check if this word is already matched or has error
    if (matchedPairs.has(word.id.toString()) || errorCards.has(`${word.id}-${type}`)) return;

    const newCard: VocabularySelectedCard = {
      ...word,
      type,
    };

    if (selectedCards.length === 0) {
      // First card selection
      setSelectedCards([newCard]);
    } else if (selectedCards.length === 1) {
      const firstCard = selectedCards[0];

      // Check if it's a valid pair (different types)
      if (firstCard.type !== type) {
        // Different types - check if they match
        if (firstCard.id === newCard.id) {
          // Correct match
          const newMatchedPairs = new Set(matchedPairs);
          newMatchedPairs.add(word.id.toString());
          
          setMatchedPairs(newMatchedPairs);
          incrementCorrectPairs(); // Increment correct pairs counter
          setSelectedCards([]);
          removeWordError(word.kanji || word.hiragana);

          // Check if section is complete
          if (newMatchedPairs.size >= gameWords.length) {
            setTimeout(() => {
              const hasMoreSections = moveToNextSection();
              if (!hasMoreSections) {
                calculateAndSetScore();
                setGameComplete(true);
              }
            }, 500);
          }
        } else {
          // Wrong match - show error
          const newErrorCards = new Set(errorCards);
          newErrorCards.add(`${firstCard.id}-${firstCard.type}`);
          newErrorCards.add(`${newCard.id}-${newCard.type}`);
          
          setErrorCards(newErrorCards);
          addWordError(word.kanji || word.hiragana);

          // Update score immediately when error occurs (like kanji pairing)
          calculateAndSetScore();

          // Clear error state after animation
          setTimeout(() => {
            setErrorCards(new Set());
            setSelectedCards([]);
          }, 800);
        }
      } else {
        // Same type selected - replace previous selection (reject same side)
        setSelectedCards([newCard]);
      }
    } else {
      // Should never happen, but reset if more than 2 cards
      setSelectedCards([newCard]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      {/* Left Column - Japanese (Kanji/Hiragana) */}
      <div className="space-y-3">
        {uniqueWords.map((word) => (
          <VocabularyPairingCard
            key={`japanese-${word.id}`}
            card={{ ...word, type: "japanese" }}
            onCardClick={(card) => handleCardClick("japanese", card)}
          />
        ))}
      </div>

      {/* Right Column - Meanings */}
      <div className="space-y-3">
        {shuffledMeanings.map((word) => (
          <VocabularyPairingCard
            key={`meaning-${word.id}`}
            card={{ ...word, type: "meaning" }}
            onCardClick={(card) => handleCardClick("meaning", card)}
          />
        ))}
      </div>
    </div>
  );
};