/**
 * Get color classes based on accuracy percentage
 * Used for kanji/vocabulary card color coding
 * 
 * @param accuracy - Accuracy percentage (0-100) or null if not attempted
 * @returns Object with text color class
 */
export function getAccuracyColor(accuracy: number | null) {
  // Not attempted yet - use default text color
  if (accuracy === null) {
    return {
      text: 'text-foreground'
    };
  }

  // >= 90% - Blue (Excellent)
  if (accuracy >= 90) {
    return {
      text: 'text-blue-500 dark:text-blue-400'
    };
  }

  // >= 80% - Green (Good)
  if (accuracy >= 80) {
    return {
      text: 'text-green-500 dark:text-green-400'
    };
  }

  // >= 70% - Yellow (Fair)
  if (accuracy >= 70) {
    return {
      text: 'text-yellow-500 dark:text-yellow-400'
    };
  }

  // < 70% - Red (Need Practice)
  return {
    text: 'text-red-500 dark:text-red-400'
  };
}

/**
 * Get accuracy label for display
 */
export function getAccuracyLabel(accuracy: number | null): string {
  if (accuracy === null) return 'Not practiced';
  if (accuracy >= 90) return 'Excellent';
  if (accuracy >= 80) return 'Good';
  if (accuracy >= 70) return 'Fair';
  return 'Need practice';
}
