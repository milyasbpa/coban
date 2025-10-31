"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { PairingCard } from "../components/pairing-card";
import { ScoreHeader } from "../fragments/score-header";
import { GameResult } from "../fragments/game-result";
import { 
  getPairingGameData, 
  shuffleArray, 
  calculateScore, 
  PairingWord, 
  GameStats 
} from "../utils/pairing-game";

interface SelectedCard {
  id: string;
  type: "kanji" | "meaning";
  content: string;
}

export function PairingExerciseContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const lessonId = searchParams.get('lessonId');
  const level = searchParams.get('level') || 'N5';
  
  // Game state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [gameWords, setGameWords] = useState<PairingWord[]>([]);
  const [shuffledKanji, setShuffledKanji] = useState<string[]>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [errorCards, setErrorCards] = useState<Set<string>>(new Set());
  const [gameStats, setGameStats] = useState<GameStats>({
    totalWords: 0,
    correctPairs: 0,
    wrongAttempts: 0,
    currentSection: 1,
    totalSections: 0,
    score: 100,
  });
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [allSections, setAllSections] = useState<PairingWord[][]>([]);

  // Initialize game
  useEffect(() => {
    if (lessonId) {
      const gameData = getPairingGameData(parseInt(lessonId), level);
      const sections = [];
      
      // Split into sections of 5
      for (let i = 0; i < gameData.words.length; i += 5) {
        sections.push(gameData.words.slice(i, i + 5));
      }
      
      setAllSections(sections);
      setGameStats(prev => ({
        ...prev,
        totalWords: gameData.totalWords,
        totalSections: sections.length,
      }));
      
      // Load first section
      if (sections.length > 0) {
        loadSection(sections[0]);
      }
    }
  }, [lessonId, level]);

  const loadSection = (sectionWords: PairingWord[]) => {
    setGameWords(sectionWords);
    setShuffledKanji(shuffleArray(sectionWords.map(w => w.kanji)));
    setShuffledMeanings(shuffleArray(sectionWords.map(w => w.meaning)));
    setSelectedCards([]);
    setMatchedPairs(new Set());
    setErrorCards(new Set());
  };

  const handleCardClick = (id: string, type: "kanji" | "meaning") => {
    if (matchedPairs.has(id) || errorCards.has(id)) return;

    const content = type === "kanji" ? id : gameWords.find(w => w.meaning === id)?.meaning || id;
    const newCard: SelectedCard = { id, type, content };

    if (selectedCards.length === 0) {
      setSelectedCards([newCard]);
    } else if (selectedCards.length === 1) {
      const firstCard = selectedCards[0];
      
      // Check if it's a valid pair
      if (firstCard.type !== type) {
        const kanjiCard = firstCard.type === "kanji" ? firstCard : newCard;
        const meaningCard = firstCard.type === "meaning" ? firstCard : newCard;
        
        const matchingWord = gameWords.find(w => 
          w.kanji === kanjiCard.id && w.meaning === meaningCard.id
        );

        if (matchingWord) {
          // Correct match
          setMatchedPairs(prev => new Set([...prev, kanjiCard.id, meaningCard.id]));
          setGameStats(prev => ({ ...prev, correctPairs: prev.correctPairs + 1 }));
          setSelectedCards([]);
          
          // Check if section is complete
          if (matchedPairs.size + 2 >= gameWords.length * 2) {
            setTimeout(() => {
              if (currentSectionIndex + 1 < allSections.length) {
                // Move to next section
                setCurrentSectionIndex(prev => prev + 1);
                setGameStats(prev => ({ ...prev, currentSection: prev.currentSection + 1 }));
                loadSection(allSections[currentSectionIndex + 1]);
              } else {
                // Game complete
                setIsGameComplete(true);
                setGameStats(prev => ({ ...prev, score: calculateScore(prev) }));
              }
            }, 500);
          }
        } else {
          // Wrong match - show error
          setErrorCards(new Set([kanjiCard.id, meaningCard.id]));
          setGameStats(prev => ({ ...prev, wrongAttempts: prev.wrongAttempts + 1 }));
          
          // Clear error state after animation
          setTimeout(() => {
            setErrorCards(new Set());
            setSelectedCards([]);
          }, 800);
        }
      } else {
        // Same type selected, replace selection
        setSelectedCards([newCard]);
      }
    }
  };

  const handleRestart = () => {
    setCurrentSectionIndex(0);
    setIsGameComplete(false);
    setGameStats({
      totalWords: gameStats.totalWords,
      correctPairs: 0,
      wrongAttempts: 0,
      currentSection: 1,
      totalSections: gameStats.totalSections,
      score: 100,
    });
    if (allSections.length > 0) {
      loadSection(allSections[0]);
    }
  };

  const handleBackToHome = () => {
    router.back();
  };

  if (isGameComplete) {
    return (
      <GameResult 
        stats={gameStats}
        onRestart={handleRestart}
        onBackToHome={handleBackToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-primary hover:text-primary/80"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      <div className="p-4">
        {/* Score Header */}
        <ScoreHeader
          score={gameStats.score}
          currentSection={gameStats.currentSection}
          totalSections={gameStats.totalSections}
          correctPairs={gameStats.correctPairs}
          totalWords={gameStats.totalWords}
        />

        {/* Game Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Left Column - Kanji */}
          <div className="space-y-3">
            {shuffledKanji.map((kanji) => (
              <PairingCard
                key={kanji}
                id={kanji}
                content={kanji}
                type="kanji"
                isSelected={selectedCards.some(c => c.id === kanji)}
                isMatched={matchedPairs.has(kanji)}
                isError={errorCards.has(kanji)}
                onClick={handleCardClick}
              />
            ))}
          </div>

          {/* Right Column - Meanings */}
          <div className="space-y-3">
            {shuffledMeanings.map((meaning) => (
              <PairingCard
                key={meaning}
                id={meaning}
                content={meaning}
                type="meaning"
                isSelected={selectedCards.some(c => c.id === meaning)}
                isMatched={matchedPairs.has(meaning)}
                isError={errorCards.has(meaning)}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>

        {/* Section Progress */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Section {gameStats.currentSection} of {gameStats.totalSections}
          </p>
        </div>
      </div>
    </div>
  );
}