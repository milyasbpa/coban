/**
 * Calculate the final score for writing exercise
 * @param correctQuestions - Number of correct questions or array of correct questions
 * @param totalQuestions - Total number of questions in the exercise
 * @returns Score between 0-100
 */
export function calculateWritingScore(
  correctQuestions: number | any[],
  totalQuestions: number
): number {
  const correctCount = typeof correctQuestions === 'number' 
    ? correctQuestions 
    : correctQuestions.length;
  
  if (totalQuestions === 0) return 0;
  
  return Math.round((correctCount / totalQuestions) * 100);
}