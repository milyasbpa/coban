/**
 * Mastery Level Utilities
 * Reusable functions for calculating and categorizing learning progress/accuracy
 * Used across vocabulary, kanji, and grammar systems
 */

export type MasteryLevel = 'master' | 'proficient' | 'learning' | 'beginner' | 'new';

export interface MasteryConfig {
  level: MasteryLevel;
  label: string;
  minAccuracy: number;
  maxAccuracy: number;
  colorClasses: {
    bg: string;
    text: string;
    border: string;
  };
}

/**
 * Mastery level configurations with thresholds and styling
 */
export const MASTERY_LEVELS: Record<MasteryLevel, MasteryConfig> = {
  master: {
    level: 'master',
    label: 'Master',
    minAccuracy: 90,
    maxAccuracy: 100,
    colorClasses: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-700',
    },
  },
  proficient: {
    level: 'proficient',
    label: 'Proficient',
    minAccuracy: 70,
    maxAccuracy: 89,
    colorClasses: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700',
    },
  },
  learning: {
    level: 'learning',
    label: 'Learning',
    minAccuracy: 40,
    maxAccuracy: 69,
    colorClasses: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700',
    },
  },
  beginner: {
    level: 'beginner',
    label: 'Beginner',
    minAccuracy: 1,
    maxAccuracy: 39,
    colorClasses: {
      bg: 'bg-slate-100 dark:bg-slate-800/50',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-300 dark:border-slate-600',
    },
  },
  new: {
    level: 'new',
    label: 'New',
    minAccuracy: 0,
    maxAccuracy: 0,
    colorClasses: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-muted',
    },
  },
};

/**
 * Get mastery level based on accuracy percentage
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Mastery level configuration
 */
export function getMasteryLevel(accuracy: number): MasteryConfig {
  if (accuracy >= 90) return MASTERY_LEVELS.master;
  if (accuracy >= 70) return MASTERY_LEVELS.proficient;
  if (accuracy >= 40) return MASTERY_LEVELS.learning;
  if (accuracy >= 1) return MASTERY_LEVELS.beginner;
  return MASTERY_LEVELS.new;
}

/**
 * Calculate average accuracy from multiple scores
 * @param scores - Array of accuracy scores (can include null/undefined)
 * @returns Average accuracy or 0 if no valid scores
 */
export function calculateAverageAccuracy(scores: (number | null | undefined)[]): number {
  const validScores = scores.filter((score): score is number => 
    score !== null && score !== undefined && !isNaN(score)
  );
  
  if (validScores.length === 0) return 0;
  
  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / validScores.length);
}

/**
 * Format accuracy for display
 * @param accuracy - Accuracy percentage
 * @returns Formatted string (e.g., "90%")
 */
export function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy)}%`;
}

/**
 * Check if item should display mastery badge
 * @param accuracy - Accuracy percentage
 * @returns True if accuracy > 0 (not new)
 */
export function shouldDisplayMastery(accuracy: number): boolean {
  return accuracy > 0;
}

/**
 * Get mastery filter options for selection UI
 * @returns Array of mastery level options for filtering
 */
export function getMasteryFilterOptions() {
  return [
    { value: 'all', label: 'All' },
    { value: 'master', label: 'Master (90%+)', minAccuracy: 90, maxAccuracy: 100 },
    { value: 'proficient', label: 'Proficient (70-89%)', minAccuracy: 70, maxAccuracy: 89 },
    { value: 'learning', label: 'Learning (40-69%)', minAccuracy: 40, maxAccuracy: 69 },
    { value: 'beginner', label: 'Beginner (1-39%)', minAccuracy: 1, maxAccuracy: 39 },
    { value: 'new', label: 'New (0%)', minAccuracy: 0, maxAccuracy: 0 },
  ];
}

/**
 * Filter items by accuracy range
 * @param accuracy - Item accuracy
 * @param filterValue - Selected filter value
 * @returns True if item matches filter
 */
export function matchesMasteryFilter(accuracy: number, filterValue: string): boolean {
  const option = getMasteryFilterOptions().find(opt => opt.value === filterValue);
  
  if (!option || filterValue === 'all') return true;
  
  if ('minAccuracy' in option && 'maxAccuracy' in option && 
      option.minAccuracy !== undefined && option.maxAccuracy !== undefined) {
    return accuracy >= option.minAccuracy && accuracy <= option.maxAccuracy;
  }
  
  return true;
}
