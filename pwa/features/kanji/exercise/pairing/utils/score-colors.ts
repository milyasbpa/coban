// Helper functions untuk score colors berdasarkan color palette
export const getScoreColor = (score: number) => {
  if (score >= 90) {
    return {
      // Hijau - menggunakan kanji-beginner color dari globals.css
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      textSecondary: 'text-green-800 dark:text-green-300'
    };
  } else if (score >= 80) {
    return {
      // Kuning - menggunakan chart-1 color yang sudah ada
      bg: 'bg-yellow-50 dark:bg-yellow-950/20', 
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      textSecondary: 'text-yellow-800 dark:text-yellow-300'
    };
  } else {
    return {
      // Merah - menggunakan destructive color dari globals.css
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800', 
      text: 'text-red-600 dark:text-red-400',
      textSecondary: 'text-red-800 dark:text-red-300'
    };
  }
};

export const getScoreTextColor = (score: number) => {
  if (score >= 90) {
    return 'text-green-600 dark:text-green-400';
  } else if (score >= 80) {
    return 'text-yellow-600 dark:text-yellow-400';
  } else {
    return 'text-red-600 dark:text-red-400';
  }
};