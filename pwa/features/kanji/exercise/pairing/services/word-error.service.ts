/**
 * Word Error Tracking Service
 * Handles tracking of wrong words during game sessions
 */
export class WordErrorService {
  /**
   * Check if a word is already in error set
   */
  static hasWordError(errorSet: Set<string>, word: string): boolean {
    return errorSet.has(word);
  }

  /**
   * Add word to error set and return if it's first error
   */
  static addWordError(errorSet: Set<string>, word: string): {
    newErrorSet: Set<string>;
    isFirstError: boolean;
  } {
    const isFirstError = !errorSet.has(word);
    const newErrorSet = new Set([...errorSet, word]);
    
    return { newErrorSet, isFirstError };
  }

  /**
   * Remove word from error set
   */
  static removeWordError(errorSet: Set<string>, word: string): {
    newErrorSet: Set<string>;
    wasRemoved: boolean;
  } {
    const wasRemoved = errorSet.has(word);
    const newErrorSet = new Set(errorSet);
    newErrorSet.delete(word);
    
    return { newErrorSet, wasRemoved };
  }

  /**
   * Merge two error sets
   */
  static mergeErrorSets(set1: Set<string>, set2: Set<string>): Set<string> {
    return new Set([...set1, ...set2]);
  }

  /**
   * Get all current wrong words from both sets
   */
  static getAllWrongWords(globalErrors: Set<string>, currentErrors: Set<string>): Set<string> {
    return this.mergeErrorSets(globalErrors, currentErrors);
  }
}