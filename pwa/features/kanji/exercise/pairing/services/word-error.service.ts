/**
 * Word Error Tracking Service  
 * Handles tracking of wrong words during game sessions
 */
export class WordErrorService {
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
}