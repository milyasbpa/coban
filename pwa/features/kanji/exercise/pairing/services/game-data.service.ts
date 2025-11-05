import { PairingWord } from "../types";
import { shuffleArray } from "../utils";

/**
 * Game Data Service
 * Handles game data manipulation and section management
 */
export class GameDataService {
  /**
   * Split words into sections of specified size (default 5)
   */
  static createSections(
    words: PairingWord[],
    sectionSize: number = 5
  ): PairingWord[][] {
    const sections: PairingWord[][] = [];

    for (let i = 0; i < words.length; i += sectionSize) {
      sections.push(words.slice(i, i + sectionSize));
    }

    return sections;
  }

  /**
   * Generate retry session words based on wrong words
   */
  static generateRetryWords(
    allGameWords: PairingWord[],
    wrongWords: string[]
  ): PairingWord[] {
    // Find wrong word data
    const wrongWordData = allGameWords.filter((w) =>
      wrongWords.includes(w.kanji)
    );

    let retryWords = [...wrongWordData];

    // Add decoy for single wrong word
    if (wrongWords.length === 1) {
      const correctWords = allGameWords.filter(
        (w) => !wrongWords.includes(w.kanji)
      );

      if (correctWords.length > 0) {
        const randomDecoy =
          correctWords[Math.floor(Math.random() * correctWords.length)];
        retryWords.push(randomDecoy);
      }
    }

    return shuffleArray(retryWords);
  }

  /**
   * Check if section is complete based on matched pairs
   */
  static isSectionComplete(
    matchedPairsCount: number,
    sectionWordsCount: number
  ): boolean {
    // Sekarang matchedPairs hanya menyimpan 1 ID per word (bukan 2)
    return matchedPairsCount >= sectionWordsCount;
  }
}
